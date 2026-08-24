import { NextResponse } from "next/server";
import { unifiedAI } from "@/lib/ai/router.unified";
import { AIProfile, AIRequestPayload } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const profile = (await req.json()) as AIProfile;

    if (!profile || !profile.provider || !profile.model) {
      return NextResponse.json({ error: "Missing provider or model in profile." }, { status: 400 });
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
    console.error("Connection Test Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unknown error occurred",
        provider: error.provider || "unknown",
        statusCode: error.statusCode || 500,
      },
      { status: error.statusCode || 500 }
    );
  }
}
