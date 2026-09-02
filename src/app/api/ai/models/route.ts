import { NextRequest, NextResponse } from "next/server";
import { fetchAvailableModels } from "@/lib/ai/dynamicModelDiscovery";
import { isSafeWebhookUrl } from "@/lib/scheduler/webhookDispatcher";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, baseURL } = body;

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }

    // SSRF guard on custom external baseURL
    if (baseURL && provider !== "ollama" && provider !== "lmstudio") {
      const check = isSafeWebhookUrl(baseURL);
      if (!check.valid) {
        return NextResponse.json(
          { error: "Restricted or invalid baseURL target" },
          { status: 400 }
        );
      }
    }

    const models = await fetchAvailableModels(provider, apiKey || "", baseURL);
    return NextResponse.json({ models });
  } catch (error: any) {
    console.error("Model discovery error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to discover models from provider", models: [] },
      { status: 500 }
    );
  }
}
