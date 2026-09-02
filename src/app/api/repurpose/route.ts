import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, extractClientIp, DAY_MS } from "@/lib/ai/serverLimiter";
import { fetchYouTubeInfo, isYouTubeUrl } from "@/lib/youtube";
import { repurposeToTwitter } from "@/lib/ai/repurpose/twitterThread";
import { repurposeToNewsletter } from "@/lib/ai/repurpose/newsletterBlog";
import { repurposeToVideoScript } from "@/lib/ai/repurpose/videoScript";

export const dynamic = "force-dynamic";

function getProfileFromHeaders(req: NextRequest) {
  const provider = req.headers.get("x-ai-provider") || undefined;
  const apiKey = req.headers.get("x-ai-key") || undefined;
  const baseURL = req.headers.get("x-ai-url") || undefined;
  const model = req.headers.get("x-ai-model") || undefined;
  if (provider && apiKey)
    return { provider, apiKey, baseURL, model: model || "gpt-3.5-turbo" } as const;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let post: string = (body.post ?? body.content ?? "").toString();
    const youtubeUrl: string | undefined =
      body.youtubeUrl || (isYouTubeUrl(post) ? post : undefined);
    const target: string = (body.target || "all").toString(); // twitter | newsletter | video | all

    // If youtube URL, fetch info and prepend
    if (youtubeUrl && isYouTubeUrl(youtubeUrl)) {
      const ytInfo = await fetchYouTubeInfo(youtubeUrl);
      post = ytInfo + (post && !isYouTubeUrl(post) ? `\n\nAdditional context:\n${post}` : "");
    } else if (post && isYouTubeUrl(post.trim()) && post.trim().split(/\s+/).length === 1) {
      // post itself is just a YouTube URL
      const ytInfo = await fetchYouTubeInfo(post.trim());
      post = ytInfo;
    }

    if (!post || post.trim().length < 20) {
      return NextResponse.json(
        { error: "Post or YouTube URL must be at least 20 characters" },
        { status: 400 }
      );
    }

    // Cost guard: 10 repurposes per day per IP for public (BYOK bypasses)
    const profile = getProfileFromHeaders(req);
    if (!profile) {
      const ip = extractClientIp(req);
      const rl = await checkRateLimit(`ip:${ip}:repurpose`, 10, DAY_MS);
      if (!rl.allowed) {
        return NextResponse.json(
          {
            error: "Rate limit — 10 repurposes per day (public)",
            code: "RATE_LIMITED",
            retryAfterMs: rl.retryAfterMs,
          },
          { status: 429, headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() } }
        );
      }
    }

    // If no BYOK profile and no platform keys, return heuristic mock (local-first)
    const hasPlatformKey = Boolean(
      process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.NVIDIA_API_KEY_DEEPSEEK
    );
    const needsAI = Boolean(profile || hasPlatformKey);

    // Helper to get AI profile or fallback mock
    const doTwitter = async () => {
      if (profile) return repurposeToTwitter(profile as never, post);
      if (hasPlatformKey) {
        // Use platform via unifiedAI with plan:free — repurpose libs currently need profile, so we mock via direct call
        // For now, return mock thread if no BYOK (keeps cost guard without API cost)
        return [
          `1/3 ${post.slice(0, 120)}...`,
          `2/3 The core insight: ${post.slice(0, 80)}`,
          `3/3 What's your take?`,
        ];
      }
      return [
        `1/3 ${post.slice(0, 120)}...`,
        `2/3 Repurposed thread (add BYOK key for AI)`,
        `3/3 Follow for more`,
      ];
    };
    const doNewsletter = async () => {
      if (profile) return repurposeToNewsletter(profile as never, post);
      return `# Newsletter: ${post.slice(0, 60)}\n\n${post}\n\n---\n*Generated locally — add BYOK key for full AI newsletter*`;
    };
    const doVideo = async () => {
      if (profile) return repurposeToVideoScript(profile as never, post);
      return `[HOOK - 0:03] ${post.slice(0, 80)}\n[VALUE - 0:30] Core insight from post\n[CTA - 0:55] Follow for more`;
    };

    if (target === "twitter") {
      const tweets = await doTwitter();
      return NextResponse.json({ tweets, target });
    }
    if (target === "newsletter") {
      const newsletter = await doNewsletter();
      return NextResponse.json({ newsletter, target });
    }
    if (target === "video") {
      const video = await doVideo();
      return NextResponse.json({ video, target });
    }

    // all = 1 post -> Thread + Newsletter 1 click (spec)
    const [tweets, newsletter] = await Promise.all([doTwitter(), doNewsletter()]);
    return NextResponse.json({ tweets, newsletter, target: "all", youtubeUrl: youtubeUrl || null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Repurpose error:", msg);
    return NextResponse.json({ error: "Failed to repurpose", details: msg }, { status: 500 });
  }
}
