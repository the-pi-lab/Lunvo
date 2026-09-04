import { NextRequest, NextResponse } from "next/server";
import { fetchAvailableModels } from "@/lib/ai/dynamicModelDiscovery";
import { validateModelBaseURL } from "@/lib/ai/baseUrlGuard";
import { checkRateLimit, extractClientIp, MINUTE_MS } from "@/lib/ai/serverLimiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const provider = typeof body?.provider === "string" ? body.provider.slice(0, 60) : "";
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.slice(0, 512) : "";
    const baseURL = typeof body?.baseURL === "string" ? body.baseURL : undefined;

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }

    // SSRF guard on any custom baseURL (no local-provider exemption hole)
    const guard = validateModelBaseURL(provider, baseURL);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: 400 });
    }

    // Discovery oracle rate limit (unauthenticated endpoint)
    const ip = extractClientIp(req);
    const rl = await checkRateLimit(`ip:${ip}:ai-models`, 10, MINUTE_MS);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded", models: [] }, { status: 429 });
    }

    const models = await fetchAvailableModels(provider, apiKey, baseURL);
    return NextResponse.json({ models });
  } catch {
    console.error("Model discovery error");
    return NextResponse.json(
      { error: "Failed to discover models from provider", models: [] },
      { status: 500 }
    );
  }
}
