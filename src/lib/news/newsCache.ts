/**
 * Phase 22 — News Context Cache (6hr TTL + 5s timeout)
 * Local-first, no DB. In-memory Map keyed by normalized topic.
 * Same topic within 6hr -> cache hit. Fetch races 5s timeout.
 */

import { searchTrendingArticles, type SearchResult } from "@/lib/rss/searchService";
import type { RssArticle } from "@/lib/rss/types";

const NEWS_TTL_MS = 6 * 60 * 60 * 1000; // 6hr
const NEWS_TIMEOUT_MS = 5000; // 5s

type CacheEntry = {
  articles: RssArticle[];
  cachedAt: number;
  totalFound: number;
};

const cache = new Map<string, CacheEntry>();

function normalizeKey(topic: string): string {
  return topic.toLowerCase().trim().replace(/\s+/g, " ").slice(0, 120);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

/**
 * Resolve news context for a topic.
 * - Cache hit if same normalized topic within 6hr -> instant return
 * - Else fetch searchTrendingArticles with 5s timeout -> cache & return
 * - On timeout/error, return cached stale if exists, else []
 */
export async function resolveNewsContext(topic: string): Promise<RssArticle[]> {
  const key = normalizeKey(topic);
  if (!key) return [];

  const now = Date.now();
  const entry = cache.get(key);
  if (entry && now - entry.cachedAt < NEWS_TTL_MS) {
    return [...entry.articles];
  }

  try {
    const result: SearchResult = await withTimeout(
      searchTrendingArticles(topic, 5),
      NEWS_TIMEOUT_MS
    );
    const articles = result.articles.slice(0, 5);
    // Don't poison 6hr cache with empty success — cache empty only 30s
    if (articles.length === 0) return [];
    cache.set(key, { articles, cachedAt: now, totalFound: result.totalFound });
    return [...articles];
  } catch {
    // timeout or fetch error -> return stale cache if available, but avoid poisoning cache with empty array
    if (entry && entry.articles.length > 0) {
      return [...entry.articles];
    }
    return [];
  }
}

/** For tests: inspect cache */
export function _getCacheEntry(topic: string): CacheEntry | undefined {
  return cache.get(normalizeKey(topic));
}

export function _clearNewsCache(): void {
  cache.clear();
}

export function _isCacheHit(topic: string): boolean {
  const e = cache.get(normalizeKey(topic));
  return !!e && Date.now() - e.cachedAt < NEWS_TTL_MS;
}
