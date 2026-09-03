import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentsNewsByKeyword } from "@/lib/news/currentsService";
import { searchTrendingArticles } from "@/lib/rss/searchService";
import { checkRateLimit, extractClientIp, MINUTE_MS } from "@/lib/ai/serverLimiter";

export const dynamic = "force-dynamic";

type LearnNewsItem = {
  topic: string;
  article: {
    title: string;
    description: string;
    source: string;
    link: string;
    date: string;
  } | null;
};

const LEARN_TOPICS = [
  "AI",
  "Market",
  "Top Tech Companies",
  "Startups",
  "Cybersecurity",
  "Cloud Computing",
  "Data Science",
  "Web Development",
  "Product Management",
  "DevOps",
] as const;

export async function GET(req: NextRequest) {
  const ip = extractClientIp(req);
  const rl = await checkRateLimit(`ip:${ip}:learn-news`, 10, MINUTE_MS);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many news requests. Please wait a minute." },
      { status: 429, headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() } }
    );
  }
  const items = await Promise.all(
    LEARN_TOPICS.map(async (topic): Promise<LearnNewsItem> => {
      const fromCurrents = await fetchCurrentsNewsByKeyword(topic, 1).catch(() => []);

      if (fromCurrents.length > 0) {
        const article = fromCurrents[0]!;
        return {
          topic,
          article: {
            title: article.title,
            description: article.description || article.title,
            source: article.source,
            link: article.link,
            date: article.date,
          },
        };
      }

      const fallback = await searchTrendingArticles(topic, 1).catch(() => ({ articles: [] }));

      if (fallback.articles.length > 0) {
        const article = fallback.articles[0]!;
        return {
          topic,
          article: {
            title: article.title,
            description: article.description || article.title,
            source: article.source,
            link: article.link,
            date: article.date,
          },
        };
      }

      return { topic, article: null };
    })
  );

  return NextResponse.json({
    topics: LEARN_TOPICS,
    items,
  });
}
