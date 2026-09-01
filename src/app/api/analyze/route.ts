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
    const body = await req.json().catch(() => ({}));
    const post: string = (body.post ?? "").toString();

    if (!post || post.trim().length < 20) {
      return NextResponse.json({ error: "Post must be at least 20 characters" }, { status: 400 });
    }
    if (post.length > 3000) {
      return NextResponse.json({ error: "Post too long (max 3000 chars)" }, { status: 400 });
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
        // Local heuristic fallback — no AI keys, still cost-guarded
        const hook = (post.split("\n")[0]?.length ?? 0) > 20 && !post.startsWith("I ") ? 7 : 4;
        result = {
          scores: {
            hook: {
              score: hook,
              label: hook > 6 ? "Good" : "Weak",
              explanation: "Hook estimated locally (no AI key)",
            },
            readability: { score: 6, label: "Good", explanation: "Readability estimated locally" },
            engagement: {
              score: post.includes("?") ? 7 : 4,
              label: post.includes("?") ? "Good" : "Weak",
              explanation: "CTA check locally",
            },
            structure: { score: 6, label: "Good", explanation: "Structure estimated locally" },
          },
          overall_score: 6,
          top_problems: ["Add specific CTA question", "Shorten first line for hook"],
          improved_post: post,
          improvement_summary: "Local heuristic analysis — configure BYOK key for full AI audit",
        };
      }
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
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Analyze error:", msg);
    return NextResponse.json({ error: "Failed to analyze post", details: msg }, { status: 500 });
  }
}
