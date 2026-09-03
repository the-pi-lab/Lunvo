import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, extractClientIp, DAY_MS } from "@/lib/ai/serverLimiter";
import { buildAnalyzePrompt } from "@/lib/ai/prompts";
import { unifiedAI, parseAIJson } from "@/lib/ai/router.unified";
import { AnalyzeResultSchema } from "@/lib/ai/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const post: string = (body.post ?? "").toString();

    if (!post || post.trim().length < 20) {
      return NextResponse.json({ error: "Post must be at least 20 characters" }, { status: 400 });
    }
    if (post.length > 3000) {
      return NextResponse.json({ error: "Post too long (max 3000 chars)" }, { status: 400 });
    }

    // Phase 24: IP limit 5/day for unauth public endpoint — 6th -> 429
    const ip = extractClientIp(req);
    const rl = await checkRateLimit(`ip:${ip}:analyze-public`, 5, DAY_MS);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded — 5 analyzes per day (public)",
          code: "RATE_LIMITED",
          retryAfterMs: rl.retryAfterMs,
        },
        { status: 429, headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() } }
      );
    }

    // Public always uses free plan with platform keys (or heuristic fallback)
    const hasPlatformKey = Boolean(
      process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.NVIDIA_API_KEY_DEEPSEEK
    );

    let result: unknown;

    if (hasPlatformKey) {
      const systemPrompt = buildAnalyzePrompt(
        post,
        "Professional",
        "Grow audience",
        "Professional"
      );
      const res = await unifiedAI({
        plan: "free",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.3,
        maxTokens: 1400,
      } as never);
      result = parseAIJson(res.text);
    } else {
      const hook = (post.split("\n")[0]?.length ?? 0) > 20 && !post.startsWith("I ") ? 7 : 4;
      const engagement = post.includes("?") ? 7 : 4;
      const overall = Math.round((hook + 6 + engagement + 6) / 4);
      result = {
        scores: {
          hook: {
            score: hook,
            label: hook > 6 ? "Good" : "Weak",
            explanation: "Hook estimated locally (no AI key)",
          },
          readability: { score: 6, label: "Good", explanation: "Readability estimated locally" },
          engagement: {
            score: engagement,
            label: engagement > 6 ? "Good" : "Weak",
            explanation: "CTA check locally",
          },
          structure: { score: 6, label: "Good", explanation: "Structure estimated locally" },
        },
        overall_score: overall,
        top_problems: ["Add specific CTA question", "Shorten first line for hook"],
        improved_post: post,
        improvement_summary: "Local heuristic analysis — public endpoint",
      };
    }

    const validated = AnalyzeResultSchema.safeParse(result);
    if (!validated.success) {
      return NextResponse.json(
        { error: "AI returned invalid JSON", details: validated.error.flatten() },
        { status: 502 }
      );
    }

    return NextResponse.json(validated.data);
  } catch (error: unknown) {
    const raw = error instanceof Error ? error.message : String(error);
    const msg = raw
      .replace(/sk-[A-Za-z0-9-_]{8,}/g, "[REDACTED]")
      .replace(/AIza[A-Za-z0-9-_]{8,}/g, "[REDACTED]")
      .slice(0, 200);
    console.error("Analyze-public error:", msg);
    return NextResponse.json({ error: "Failed to analyze post" }, { status: 500 });
  }
}
