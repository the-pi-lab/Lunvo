import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, extractClientIp, DAY_MS } from "@/lib/ai/serverLimiter";
import { buildAnalyzePrompt, LINKEDIN_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { unifiedAI, parseAIJson } from "@/lib/ai/router.unified";
import { AnalyzeResultSchema } from "@/lib/ai/schemas";

export const dynamic = "force-dynamic";

function getIsBYOK(req: NextRequest): boolean {
  const key = req.headers.get("x-ai-key");
  const provider = req.headers.get("x-ai-provider");
  // Minimum length check to prevent single-char dummy key bypass
  return Boolean(provider && key && key.trim().length >= 8);
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json().catch(() => null);
    // Strict shape: no .toString() coercion of arrays/objects (prompt-injection
    // via crafted JSON + token-cost bypass).
    const rawPost =
      body && typeof body === "object" ? (body as { post?: unknown }).post : undefined;
    if (typeof rawPost !== "string") {
      return NextResponse.json({ error: "Post must be a string" }, { status: 400 });
    }
    const post = rawPost.slice(0, 3000);

    if (!post || post.trim().length < 20) {
      return NextResponse.json({ error: "Post must be at least 20 characters" }, { status: 400 });
    }

    // Phase 24: Cost Guard — unauth IP limit 5/day, 6th -> 429
    // BYOK users bypass IP limit (they use their own keys)
    const isBYOK = getIsBYOK(req);
    if (!isBYOK) {
      const ip = extractClientIp(req);
      const rl = await checkRateLimit(`ip:${ip}:analyze`, 5, DAY_MS);
      if (!rl.allowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded — 5 analyzes per day for public users",
            code: "RATE_LIMITED",
            retryAfterMs: rl.retryAfterMs,
          },
          { status: 429, headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() } }
        );
      }
    }

    // Try BYOK headers first (client sends x-ai-*), fallback to platform keys (plan: free)
    const provider = req.headers.get("x-ai-provider") || undefined;
    const apiKey = req.headers.get("x-ai-key") || undefined;
    const baseURL = req.headers.get("x-ai-url") || undefined;
    const model = req.headers.get("x-ai-model") || undefined;

    // SSRF guard: x-ai-url is server-fetched — same rules as /api/ai/models
    // (local providers restricted to loopback, everything else validated).
    if (provider && apiKey && baseURL) {
      const { validateModelBaseURL } = await import("@/lib/ai/baseUrlGuard");
      const guard = validateModelBaseURL(provider, baseURL);
      if (!guard.ok) {
        return NextResponse.json({ error: guard.error }, { status: 400 });
      }
    }

    let result: unknown;

    if (provider && apiKey) {
      // BYOK path — use profile
      const profile = { provider, apiKey, baseURL, model: model || "gpt-3.5-turbo" } as const;
      const userPrompt = buildAnalyzePrompt(post, "Professional", "Growth", "Professional");
      const res = await unifiedAI({
        profile: profile as never,
        messages: [
          { role: "system", content: LINKEDIN_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 1400,
      });
      result = parseAIJson(res.text);
    } else {
      // Platform path — use free plan (Phase 21 live ER wiring will handle fallback)
      // If no platform keys are configured, we still enforce the limit but return a heuristic mock
      const hasPlatformKey = Boolean(
        process.env.GEMINI_API_KEY ||
        process.env.GROQ_API_KEY ||
        process.env.NVIDIA_API_KEY_DEEPSEEK
      );
      if (hasPlatformKey) {
        const userPrompt = buildAnalyzePrompt(post, "Professional", "Growth", "Professional");
        const res = await unifiedAI({
          plan: "free",
          messages: [
            { role: "system", content: LINKEDIN_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
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
          improvement_summary: "Local heuristic analysis — configure BYOK key for full AI audit",
        };
      }
    }

    const validated = AnalyzeResultSchema.safeParse(result);
    if (!validated.success) {
      console.error("Analyze validation failed:", validated.error.flatten());
      return NextResponse.json({ error: "AI returned invalid response" }, { status: 502 });
    }

    return NextResponse.json(validated.data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Analyze error:", msg);
    return NextResponse.json(
      { error: "Failed to analyze post. Please check your AI configuration." },
      { status: 500 }
    );
  }
}
