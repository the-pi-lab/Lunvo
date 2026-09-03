import { NextRequest, NextResponse } from "next/server";
import { searchTrendingArticles } from "@/lib/rss/searchService";
import { checkRateLimit, extractClientIp, MINUTE_MS } from "@/lib/ai/serverLimiter";

// Mark this route as dynamic (uses query parameters)
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const ip = extractClientIp(req);
    const rl = await checkRateLimit(`ip:${ip}:search-trending`, 20, MINUTE_MS);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many search requests. Please wait a minute." },
        { status: 429, headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() } }
      );
    }
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const results = await searchTrendingArticles(query, Math.min(limit, 20));

    return NextResponse.json({
      success: true,
      ...results,
      posts: results.articles.map((article) => ({
        post: composeTrendingPost(article.title, article.description, article.source, query),
        description: cleanDescription(article.description) || article.title,
        source: article.source,
        title: article.title,
        link: article.link,
        date: article.date,
        suggested_hashtags: extractHashtags(`${article.title} ${article.description || ""}`),
      })),
    });
  } catch (error) {
    console.error("Search trending error:", error);
    return NextResponse.json({ error: "Failed to search trending posts" }, { status: 500 });
  }
}

function cleanDescription(text?: string): string {
  if (!text) {
    return "";
  }

  const cleaned = text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= 700) {
    return cleaned;
  }

  const snippet = cleaned.slice(0, 700);
  const lastBoundary = Math.max(
    snippet.lastIndexOf("."),
    snippet.lastIndexOf("!"),
    snippet.lastIndexOf("?")
  );
  if (lastBoundary > 300) {
    return snippet.slice(0, lastBoundary + 1).trim();
  }

  const lastSpace = snippet.lastIndexOf(" ");
  if (lastSpace > 300) {
    return `${snippet.slice(0, lastSpace).trim()}...`;
  }

  return `${snippet.trim()}...`;
}

function hashText(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickVariant(items: string[], seed: number): string {
  return items[Math.abs(seed) % items.length]!;
}

function composeTrendingPost(
  title: string,
  description: string | undefined,
  source: string,
  query: string
): string {
  const summary = cleanDescription(description);
  const sourceName = (source.split("(")[0] ?? "").trim();
  const topic = query.trim().toLowerCase() || "this space";
  const seed = hashText(`${title}|${sourceName}|${topic}`);

  const opener = pickVariant(
    [
      `Interesting signal from ${sourceName}:`,
      `A practical trend worth noting from ${sourceName}:`,
      `One update I would not ignore from ${sourceName}:`,
      `This caught my attention in ${sourceName}:`,
    ],
    seed
  );

  const take = pickVariant(
    [
      `My take: teams building in ${topic} should track this early and adjust their roadmap.`,
      `My take: this can change how people position products in ${topic}.`,
      `My take: this is less hype and more a timing signal for builders in ${topic}.`,
      `My take: the edge here is execution speed, not just awareness.`,
    ],
    seed + 7
  );

  const closingQuestion = pickVariant(
    [
      `What do you think this means for the next 6-12 months?`,
      `Would you treat this as a short-term spike or a long-term shift?`,
      `If you are building right now, what would you change first?`,
      `Do you see this creating a real opportunity or just noise?`,
    ],
    seed + 17
  );

  return [
    opener,
    title,
    "",
    summary || `This topic is gaining momentum in ${sourceName}.`,
    "",
    take,
    "",
    closingQuestion,
  ].join("\n");
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
