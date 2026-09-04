import { NextResponse } from "next/server";
import { unifiedAI } from "@/lib/ai/router.unified";
import { AIProfile, AIRequestPayload } from "@/lib/ai/types";
import { checkRateLimit, extractClientIp, MINUTE_MS } from "@/lib/ai/serverLimiter";
import { validateModelBaseURL } from "@/lib/ai/baseUrlGuard";

export const dynamic = "force-dynamic";

function redact(msg: string): string {
  return msg
    .replace(/sk-[A-Za-z0-9-_]{8,}/g, "[REDACTED]")
    .replace(/AIza[A-Za-z0-9-_]{8,}/g, "[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9-_.~+/=]{8,}/gi, "Bearer [REDACTED]")
    .slice(0, 200);
}

export async function POST(req: Request) {
  try {
    const raw: unknown = await req.json().catch(() => null);
    const p = (raw ?? {}) as Partial<AIProfile>;
    const provider = typeof p.provider === "string" ? p.provider.slice(0, 60) : "";
    const model = typeof p.model === "string" ? p.model.slice(0, 120) : "";
    const apiKey = typeof p.apiKey === "string" ? p.apiKey.slice(0, 512) : undefined;
    const baseURL = typeof p.baseURL === "string" ? p.baseURL : undefined;

    if (!provider || !model) {
      return NextResponse.json({ error: "Missing provider or model in profile." }, { status: 400 });
    }

    // SSRF guard on any custom baseURL (no local-provider exemption hole)
    const guard = validateModelBaseURL(provider, baseURL);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: 400 });
    }

    // Unauthenticated fetch oracle — rate limit it
    const ip = extractClientIp(req);
    const rl = await checkRateLimit(`ip:${ip}:ai-test`, 10, MINUTE_MS);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }

    const profile = { provider, model, apiKey, baseURL } as AIProfile;

    const payload: AIRequestPayload = {
      messages: [
        { role: "user", content: 'Respond with exactly the word "SUCCESS" and nothing else.' },
      ],
      maxTokens: 10,
      temperature: 0,
    };

    const response = await unifiedAI({
      profile,
      messages: payload.messages,
      temperature: payload.temperature,
      maxTokens: payload.maxTokens,
    });

    return NextResponse.json({
      success: true,
      latencyMs: response.latencyMs,
      text: response.text,
      provider: profile.provider,
      model: profile.model,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Connection Test Error");

    // Never reflect provider status codes or raw messages (status smuggling
    // + key-fragment leaks). Fixed 502, redacted message.
    return NextResponse.json(
      {
        success: false,
        error: redact(msg) || "Failed to connect to AI provider",
        provider: "unknown",
      },
      { status: 502 }
    );
  }
}
