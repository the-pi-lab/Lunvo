/**
 * Hacker News API Service (FREE, NO API KEY REQUIRED)
 * Official Firebase REST API: https://github.com/HackerNews/API
 * Fetches top stories from tech and AI community
 */

import { RssArticle } from "./types";

const HACKER_NEWS_API_BASE = "https://hacker-news.firebaseio.com/v0";

interface HNStory {
  id: number;
  title: string;
  url?: string;
  by: string;
  score: number;
  time: number;
  type: string;
  text?: string;
}

/**
 * Truncate description intelligently at word/sentence boundaries
 */
function normalizeDescription(rawText?: string): string {
  if (!rawText) return "";

  const snippet = rawText
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (snippet.length <= 400) return snippet;

  const boundary = Math.max(
    snippet.lastIndexOf(". ", 400),
    snippet.lastIndexOf("! ", 400),
    snippet.lastIndexOf("? ", 400)
  );

  if (boundary > 250) {
    return snippet.slice(0, boundary + 1).trim();
  }

  const lastSpace = snippet.lastIndexOf(" ");
  if (lastSpace > 300) {
    return `${snippet.slice(0, lastSpace).trim()}...`;
  }

  return `${snippet.trim()}...`;
}

/**
 * Fetch top stories from Hacker News Firebase API in parallel
 * No API key required, completely free!
 */
export async function fetchHackerNewsStories(limit: number = 15): Promise<RssArticle[]> {
  try {
    const topStoriesRes = await fetch(`${HACKER_NEWS_API_BASE}/topstories.json`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!topStoriesRes.ok) {
      console.error("Failed to fetch Hacker News story IDs");
      return [];
    }

    const storyIds: number[] = await topStoriesRes.json();
    const limitedIds = storyIds.slice(0, limit);

    const itemPromises: Promise<RssArticle | null>[] = limitedIds.map(async (storyId) => {
      try {
        const storyRes = await fetch(`${HACKER_NEWS_API_BASE}/item/${storyId}.json`, {
          signal: AbortSignal.timeout(8000),
          next: { revalidate: 1800 }, // Cache for 30 minutes
        });

        if (!storyRes.ok) return null;

        const story: HNStory = await storyRes.json();

        if (!story || !story.title) return null;
        if (story.title.match(/^(Ask HN:|Show HN:|Launch HN:|Tell HN:)/i)) return null;
        if (!story.url) return null;
        if (story.score < 20) return null;

        const description = normalizeDescription(story.text) || "Trending on Hacker News";

        const article: RssArticle = {
          title: story.title,
          link: story.url,
          date: new Date(story.time * 1000).toISOString(),
          description,
          source: `Hacker News (${story.score} pts)`,
        };
        return article;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(itemPromises);
    return results.filter((item): item is RssArticle => item !== null);
  } catch (error) {
    console.error("Error fetching Hacker News stories:", error);
    return [];
  }
}

/**
 * Fetch best stories from Hacker News in parallel (highest quality)
 */
export async function fetchHackerNewsBestStories(limit: number = 10): Promise<RssArticle[]> {
  try {
    const bestStoriesRes = await fetch(`${HACKER_NEWS_API_BASE}/beststories.json`, {
      next: { revalidate: 3600 },
    });

    if (!bestStoriesRes.ok) {
      return [];
    }

    const storyIds: number[] = await bestStoriesRes.json();
    const limitedIds = storyIds.slice(0, limit);

    const itemPromises: Promise<RssArticle | null>[] = limitedIds.map(async (storyId) => {
      try {
        const storyRes = await fetch(`${HACKER_NEWS_API_BASE}/item/${storyId}.json`, {
          signal: AbortSignal.timeout(8000),
          next: { revalidate: 1800 },
        });

        if (!storyRes.ok) return null;

        const story: HNStory = await storyRes.json();

        if (!story || !story.title) return null;
        if (story.title.match(/^(Ask HN:|Show HN:|Launch HN:|Tell HN:)/i)) return null;
        if (!story.url) return null;

        const description = normalizeDescription(story.text) || "Top story on Hacker News";

        const article: RssArticle = {
          title: story.title,
          link: story.url,
          date: new Date(story.time * 1000).toISOString(),
          description,
          source: `HN Best (${story.score} pts)`,
        };
        return article;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(itemPromises);
    return results.filter((item): item is RssArticle => item !== null);
  } catch (error) {
    console.error("Error fetching Hacker News best stories:", error);
    return [];
  }
}
