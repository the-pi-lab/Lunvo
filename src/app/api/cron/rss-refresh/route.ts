import { NextRequest, NextResponse } from "next/server";
import { refreshRssSystem, getRssSystemSnapshot, startRssScheduler } from "@/lib/rss/scheduler";
import { checkRateLimit, extractClientIp } from "@/lib/ai/serverLimiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // CRON authorization check
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    const customHeader = req.headers.get("x-cron-secret");
    const isAuthorized = authHeader === `Bearer ${cronSecret}` || customHeader === cronSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
    }
  } else {
    // If no secret configured, enforce IP rate limit to prevent denial of service (1 refresh / min)
    const ip = extractClientIp(req);
    const rl = await checkRateLimit(`cron-rss:${ip}`, 2, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many RSS refresh requests. Please wait a minute." },
        { status: 429 }
      );
    }
  }

  startRssScheduler();
  await refreshRssSystem();

  const snapshot = getRssSystemSnapshot();

  return NextResponse.json({
    success: true,
    cachedFeeds: snapshot.cachedFeeds.length,
    cachedPosts: snapshot.generatedPostsCache.length,
    lastFetchedAt: snapshot.lastFetchedAt,
    lastGeneratedAt: snapshot.lastGeneratedAt,
    lastError: snapshot.lastError,
  });
}
