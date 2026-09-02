import { NextResponse } from "next/server";
import { unifiedAI } from "@/lib/ai/router.unified";
import { AIProfile, AIRequestPayload } from "@/lib/ai/types";
import { isSafeWebhookUrl } from "@/lib/scheduler/webhookDispatcher";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const profile = (await req.json()) as AIProfile;

    if (!profile || !profile.provider || !profile.model) {
      return NextResponse.json({ error: "Missing provider or model in profile." }, { status: 400 });
    }

    // SSRF guard on custom external baseURL
    if (profile.baseURL && profile.provider !== "ollama" && profile.provider !== "lmstudio") {
      const check = isSafeWebhookUrl(profile.baseURL);
      if (!check.valid) {
        return NextResponse.json(
          { error: "Restricted or invalid baseURL target" },
          { status: 400 }
        );
      }
    }

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
  } catch (error: any) {
    console.error("Connection Test Error:", error?.message || error);

    const rawStatus = typeof error?.statusCode === "number" ? error.statusCode : 500;
    const httpStatus = rawStatus >= 200 && rawStatus <= 599 ? rawStatus : 500;

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect to AI provider",
        provider: error.provider || "unknown",
        statusCode: rawStatus,
      },
      { status: httpStatus }
    );
  }
}
