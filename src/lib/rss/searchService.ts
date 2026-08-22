import type { RssArticle } from "./types";
import { fetchLatestRssArticles } from "./rssService";
import { fetchHackerNewsStories } from "./hackerNewsService";
import { fetchDevtoArticles } from "./devtoService";
import { fetchGithubTrendingViaAPI } from "./githubService";
import { fetchCurrentsNewsByKeyword } from "../news/currentsService";

const SEARCH_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "over",
  "about",
  "your",
  "have",
  "will",
  "what",
  "when",
  "where",
  "after",
  "before",
]);

const SEARCH_CACHE_TTL_MS = 2 * 60 * 1000;

type CachedSearchEntry = {
  result: SearchResult;
  cachedAt: number;
};

const searchCache = new Map<string, CachedSearchEntry>();

export interface SearchResult {
  articles: RssArticle[];
  query: string;
  totalFound: number;
  sources: string[];
}

function getCachedResult(cacheKey: string): SearchResult | null {
  const entry = searchCache.get(cacheKey);
  if (!entry) {
    return null;
  }

  if (Date.now() - entry.cachedAt > SEARCH_CACHE_TTL_MS) {
    searchCache.delete(cacheKey);
    return null;
  }

  return {
    ...entry.result,
    articles: [...entry.result.articles],
    sources: [...entry.result.sources],
  };
}

function setCachedResult(cacheKey: string, result: SearchResult): void {
  searchCache.set(cacheKey, {
    result: {
      ...result,
      articles: [...result.articles],
      sources: [...result.sources],
    },
    cachedAt: Date.now(),
  });
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSourceKey(source: string): string {
  return (source.split("(")[0] ?? "").trim().toLowerCase();
}

function queryTokens(query: string): string[] {
  const tokens = normalizeText(query)
    .split(" ")
    .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token));

  return tokens.length > 0 ? tokens : [normalizeText(query)];
}

function getPrimaryKeyword(query: string): string {
  return queryTokens(query)[0] ?? "technology";
}

function computeRelevance(article: RssArticle, normalizedQuery: string, tokens: string[]): number {
  const title = normalizeText(article.title);
  const description = normalizeText(article.description ?? "");
  const source = normalizeText(article.source);
  let score = 0;

  if (title.includes(normalizedQuery)) score += 20;
  if (description.includes(normalizedQuery)) score += 14;
  if (source.includes(normalizedQuery)) score += 8;

  for (const token of tokens) {
    if (title.includes(token)) score += 6;
    if (description.includes(token)) score += 3;
    if (source.includes(token)) score += 2;
  }

  const publishedAt = Date.parse(article.date);
  if (!Number.isNaN(publishedAt)) {
    const ageHours = (Date.now() - publishedAt) / (1000 * 60 * 60);
    if (ageHours <= 24) score += 6;
    else if (ageHours <= 72) score += 4;
    else if (ageHours <= 168) score += 2;
  }

  if (/techcrunch|the verge|a16z|hacker news|dev\.to/i.test(article.source)) {
    score += 2;
  }

  return score;
}

/**
 * Search trending articles across all sources by keyword
 * Returns top 5 matching results
 */
export async function searchTrendingArticles(
  query: string,
  limit: number = 5
): Promise<SearchResult> {
  if (!query || query.trim().length < 2) {
    return {
      articles: [],
      query,
      totalFound: 0,
      sources: [],
    };
  }

  const normalizedQuery = query.toLowerCase().trim();
  const normalizedSearchQuery = normalizeText(normalizedQuery);

  if (!normalizedSearchQuery) {
    return {
      articles: [],
      query: normalizedQuery,
      totalFound: 0,
      sources: [],
    };
  }

  const tokens = queryTokens(normalizedSearchQuery);
  const devtoTag = getPrimaryKeyword(normalizedSearchQuery);
  const cacheKey = `${normalizedSearchQuery}|${limit}`;

  const cachedResult = getCachedResult(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  try {
    // Fetch from all sources in parallel
    const [rssArticles, hnArticles, devtoArticles, githubArticles, currentsArticles] = await Promise.all([
      fetchLatestRssArticles().catch((error) => {
        console.error("RSS search error:", error);
        return [];
      }),
      fetchHackerNewsStories(30).catch((error) => {
        console.error("HN search error:", error);
        return [];
      }),
      fetchDevtoArticles(15, devtoTag).catch((error) => {
        console.error("DevTo search error:", error);
        return [];
      }),
      fetchGithubTrendingViaAPI(15, normalizedQuery).catch((error) => {
        console.error("GitHub search error:", error);
        return [];
      }),
      fetchCurrentsNewsByKeyword(normalizedQuery, 15).catch((error) => {
        console.error("Currents search error:", error);
        return [];
      }),
    ]);

    // Combine all articles
    const allArticles = [
      ...rssArticles,
      ...hnArticles,
      ...devtoArticles,
      ...githubArticles,
      ...currentsArticles,
    ];

    const scored = allArticles
      .map((article) => ({
        article,
        score: computeRelevance(article, normalizedSearchQuery, tokens),
      }))
      .filter(({ score }) => score >= 8)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return new Date(b.article.date).getTime() - new Date(a.article.date).getTime();
      });

    const seen = new Set<string>();
    const deduped = scored.filter(({ article }) => {
      const key = `${article.link}|${article.title.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    const perSourceLimit = 2;
    const sourceCounts = new Map<string, number>();
    const selected: RssArticle[] = [];

    for (const item of deduped) {
      const source = getSourceKey(item.article.source);
      const count = sourceCounts.get(source) || 0;
      if (count >= perSourceLimit) {
        continue;
      }
      selected.push(item.article);
      sourceCounts.set(source, count + 1);
      if (selected.length >= limit) {
        break;
      }
    }

    if (selected.length < limit) {
      for (const item of deduped) {
        const exists = selected.some((current) => current.link === item.article.link);
        if (exists) {
          continue;
        }
        selected.push(item.article);
        if (selected.length >= limit) {
          break;
        }
      }
    }

    // Get unique sources from results
    const sourcesSet = new Set(selected.map((a) => (a.source.split("(")[0] ?? "").trim()));

    const searchResult: SearchResult = {
      articles: selected.slice(0, limit),
      query: normalizedQuery,
      totalFound: deduped.length,
      sources: Array.from(sourcesSet),
    };

    setCachedResult(cacheKey, searchResult);
    return searchResult;
  } catch (error) {
    console.error("Search trending error:", error);
    return {
      articles: [],
      query: normalizedQuery,
      totalFound: 0,
      sources: [],
    };
  }
}

/**
 * Get search suggestions based on popular topics
 */
export function getSearchSuggestions(): string[] {
  return [
    "AI",
    "Machine Learning",
    "Web Development",
    "React",
    "TypeScript",
    "JavaScript",
    "DevOps",
    "Cloud",
    "Crypto",
    "Startup",
    "Tech News",
    "Design",
    "Product",
    "Mobile",
    "Database",
  ];
}
