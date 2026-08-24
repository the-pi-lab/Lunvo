import { NextRequest, NextResponse } from "next/server";
import { unifiedText, parseAIJson } from "@/lib/ai/router.unified";
import { LINKEDIN_SYSTEM_PROMPT, buildAnalyzePrompt, AI_CONFIG } from "@/lib/ai/prompts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const customKeys = {
      gemini: req.headers.get("x-gemini-key") || undefined,
      groq: req.headers.get("x-groq-key") || undefined,
    };
    const body = await req.json();
    const post = String(body?.post || "").trim();

    if (!post || post.length < 20) {
      return NextResponse.json(
        { error: "Post content is too short (min 20 characters)" },
        { status: 400 }
      );
    }

    if (post.length > 3000) {
      return NextResponse.json(
        { error: "Post too long. Maximum 3000 characters." },
        { status: 400 }
      );
    }

    const userPrompt = buildAnalyzePrompt(post, "Professional", "Grow audience", "Professional");

    const rawResponse = await unifiedText({
      systemPrompt: LINKEDIN_SYSTEM_PROMPT,
      userPrompt,
      plan: "free",
      temperature: AI_CONFIG.temperature.analyze,
      maxTokens: AI_CONFIG.max_tokens.analyze,
      customKeys,
    });

    const result = parseAIJson(rawResponse);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Public analyze error:", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
