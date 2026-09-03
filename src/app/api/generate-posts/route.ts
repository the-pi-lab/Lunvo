import { NextRequest, NextResponse } from "next/server";
import { refreshRssSystem, getRssSystemSnapshot, startRssScheduler } from "@/lib/rss/scheduler";
import { checkRateLimit, extractClientIp, MINUTE_MS } from "@/lib/ai/serverLimiter";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = extractClientIp(req);
    const rl = await checkRateLimit(`ip:${ip}:generate-posts`, 10, MINUTE_MS);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a minute." },
        { status: 429, headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() } }
      );
    }
    startRssScheduler();

    const customKeys = {
      gemini: req.headers.get("x-gemini-key") || undefined,
      groq: req.headers.get("x-groq-key") || undefined,
    };

    // Check if user wants to force refresh
    const body = await req.json().catch(() => ({}));
    const forceRefresh = body.forceRefresh === true;

    // If force refresh requested, refresh the system
    if (forceRefresh) {
      await refreshRssSystem(customKeys);
    }

    // Get cached posts
    const snapshot = getRssSystemSnapshot();
    const posts = snapshot.generatedPostsCache;

    if (posts.length === 0) {
      // If no posts cached, try refreshing
      await refreshRssSystem(customKeys);
      const newSnapshot = getRssSystemSnapshot();
      return NextResponse.json({
        success: true,
        posts: newSnapshot.generatedPostsCache.map((post) => ({
          post: post.post,
          source: post.source,
          title: post.title,
          description: post.description || post.title,
          suggested_hashtags: extractHashtags(
            `${post.title} ${post.description || ""} ${post.post}`
          ),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      posts: posts.map((post) => ({
        post: post.post,
        source: post.source,
        title: post.title,
        description: post.description || post.title,
        suggested_hashtags: extractHashtags(`${post.title} ${post.description || ""} ${post.post}`),
      })),
    });
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending posts" },
      { status: 500 }
    );
  }
}

// Fallback GET method for simple refresh
export async function GET(req: NextRequest) {
  try {
    const ip = extractClientIp(req);
    const rl = await checkRateLimit(`ip:${ip}:generate-posts-get`, 15, MINUTE_MS);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a minute." },
        { status: 429, headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() } }
      );
    }
    startRssScheduler();

    const snapshot = getRssSystemSnapshot();
    const posts = snapshot.generatedPostsCache;

    if (posts.length === 0) {
      await refreshRssSystem();
      const newSnapshot = getRssSystemSnapshot();
      return NextResponse.json({
        success: true,
        posts: newSnapshot.generatedPostsCache.map((post) => ({
          post: post.post,
          source: post.source,
          title: post.title,
          description: post.description || post.title,
          suggested_hashtags: extractHashtags(
            `${post.title} ${post.description || ""} ${post.post}`
          ),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      posts: posts.map((post) => ({
        post: post.post,
        source: post.source,
        title: post.title,
        description: post.description || post.title,
        suggested_hashtags: extractHashtags(`${post.title} ${post.description || ""} ${post.post}`),
      })),
    });
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending posts" },
      { status: 500 }
    );
  }
}

function extractHashtags(text: string): string[] {
  const stopWords = new Set([
    "that",
    "this",
    "with",
    "from",
    "have",
    "will",
    "into",
    "their",
    "about",
    "after",
    "before",
    "there",
    "these",
    "those",
    "where",
    "which",
    "https",
    "www",
  ]);

  const explicitHashtags = (text.match(/#[a-z0-9_]+/gi) || []).map((tag) =>
    tag.replace(/^#/, "").toLowerCase()
  );
  const keywords = text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3 && word.length <= 20)
    .filter((word) => !stopWords.has(word))
    .filter((word) => !/^\d+$/.test(word));

  return Array.from(new Set([...explicitHashtags, ...keywords])).slice(0, 5);
}
