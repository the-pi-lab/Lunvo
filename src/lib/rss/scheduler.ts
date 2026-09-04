import { fetchLatestRssArticles } from "./rssService";
import { fetchHackerNewsStories } from "./hackerNewsService";
import { fetchDevtoArticles } from "./devtoService";
import { fetchGithubTrendingViaAPI } from "./githubService";
import { fetchCurrentsLatestNews } from "../news/currentsService";
import {
  getRssCacheSnapshot,
  pickRandomArticles,
  setCachedFeeds,
  setGeneratedPostsCache,
  setLastError,
  setRefreshing,
} from "./cacheService";
import { generateLinkedInPostsFromArticles } from "./aiService";
import type { RssArticle } from "./types";
import type { AICustomKeys } from "../ai/router";

const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// Re-entrancy guard: concurrent generate-posts + cron hits used to pile up
// full RSS+AI pipelines with last-writer-wins caches. One flight at a time.
let inFlight: Promise<void> | null = null;

async function rebuildCaches(customKeys?: AICustomKeys): Promise<void> {
  if (inFlight) return inFlight;
  if (getRssCacheSnapshot().refreshing) return;
  setRefreshing(true);

  inFlight = (async () => {
    try {
      // Fetch from all sources in parallel
      const [rssArticles, hnArticles, devtoArticles, githubArticles, currentsArticles] =
        await Promise.all([
          fetchLatestRssArticles().catch((error) => {
            console.error("RSS fetch error:", error);
            return [];
          }),
          fetchHackerNewsStories(15).catch((error) => {
            console.error("Hacker News fetch error:", error);
            return [];
          }),
          fetchDevtoArticles(15, "technology").catch((error) => {
            console.error("Dev.to fetch error:", error);
            return [];
          }),
          fetchGithubTrendingViaAPI(15).catch((error) => {
            console.error("GitHub fetch error:", error);
            return [];
          }),
          fetchCurrentsLatestNews(20).catch((error) => {
            console.error("Currents fetch error:", error);
            return [];
          }),
        ]);

      // Combine all articles
      const allArticles: RssArticle[] = [
        ...rssArticles,
        ...hnArticles,
        ...devtoArticles,
        ...githubArticles,
        ...currentsArticles,
      ];

      // Store combined articles
      if (allArticles.length > 0) {
        setCachedFeeds(allArticles);
      }

      // Select diverse articles (up to 25 from combined sources)
      const sourceArticles =
        allArticles.length > 0 ? allArticles : getRssCacheSnapshot().cachedFeeds;
      const selectedArticles = pickRandomArticles(Math.min(25, sourceArticles.length));

      // Generate LinkedIn posts from selected articles
      if (selectedArticles.length > 0) {
        const generatedPosts = await generateLinkedInPostsFromArticles(
          selectedArticles,
          customKeys
        );
        if (generatedPosts.length > 0) {
          setGeneratedPostsCache(generatedPosts);
        }
      }

      setLastError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "RSS refresh failed";
      setLastError(message);
      console.error("Scheduler error:", message);
    } finally {
      setRefreshing(false);
      inFlight = null;
    }
  })();
  return inFlight;
}

export async function refreshRssSystem(customKeys?: AICustomKeys): Promise<void> {
  await rebuildCaches(customKeys);
}

export function startRssScheduler(): void {
  if (globalThis.__rssSchedulerId) {
    return;
  }

  globalThis.__rssSchedulerId = setInterval(() => {
    void rebuildCaches();
  }, REFRESH_INTERVAL_MS);

  globalThis.__rssSchedulerId.unref?.();

  if (getRssCacheSnapshot().cachedFeeds.length === 0) {
    void rebuildCaches();
  }
}

export function getRssSystemSnapshot() {
  return getRssCacheSnapshot();
}
