import { NextRequest, NextResponse } from "next/server";
import { unifiedText, parseAIJson } from "@/lib/ai/router.unified";
import { LINKEDIN_SYSTEM_PROMPT, buildAnalyzePrompt, AI_CONFIG } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

// Validate score is strictly 0-10 integer
function validateScore(score: any): number {
  const num = Number(String(score ?? ""));
  if (isNaN(num)) return 0;
  // Clamp strictly between 0 and 10
  return Math.max(0, Math.min(10, Math.round(num)));
}

// Recalculate overall score server-side (don't trust AI's math)
function calculateOverall(hook: number, read: number, eng: number, str: number): number {
  const avg = (hook + read + eng + str) / 4;
  return Math.round(avg * 10) / 10; // 1 decimal place
}

export async function POST(req: NextRequest) {
  try {
    const customKeys = {
      gemini: req.headers.get("x-gemini-key") || undefined,
      groq: req.headers.get("x-groq-key") || undefined,
    };
    const { post } = await req.json();

    if (!post || post.length < 20) {
      return NextResponse.json(
        { error: "Post content is too short (min 20 characters)" },
        { status: 400 }
      );
    }

    // 1. Get user session (REQUIRED)
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    const userPlan = (userData.plan as any) || "free";

    // Daily limit check via Supabase RPC
    const { data: limitCheck, error: limitError } = await supabase.rpc(
      "check_and_increment_analyze",
      {
        p_user_id: user.id,
        p_plan: userPlan,
      }
    );

    if (limitError) {
      console.error("Limit check error:", limitError);
      return NextResponse.json({ error: "Service error" }, { status: 500 });
    }

    const limitResult = limitCheck as { allowed: boolean; used: number; limit: number };

    if (!limitResult.allowed) {
      return NextResponse.json(
        {
          error: "daily_limit_reached",
          message: `You've used all ${limitResult.limit} analyses for today.`,
          used: limitResult.used,
          limit: limitResult.limit,
          resets_at: "midnight UTC",
        },
        { status: 429 }
      );
    }

    // 3. Get persona
    const { data: personaData } = await supabase
      .from("personas")
      .select("role, goal, tone")
      .eq("user_id", user.id)
      .single();

    const persona = personaData || {
      role: "Professional",
      goal: "Grow audience",
      tone: "Professional",
    };

    // 4. Build Prompt and call AI
    const userPrompt = buildAnalyzePrompt(post, persona.role, persona.goal, persona.tone);
    const rawResponse = await unifiedText({
      systemPrompt: LINKEDIN_SYSTEM_PROMPT,
      userPrompt,
      plan: userPlan,
      temperature: AI_CONFIG.temperature.analyze,
      maxTokens: AI_CONFIG.max_tokens.analyze,
      customKeys,
    });

    // 5. Parse JSON response
    const result = parseAIJson(rawResponse);

    // 6. Validate and extract scores
    const scores = (result as any).scores || {};
    const hookS = validateScore(scores.hook?.score);
    const readS = validateScore(scores.readability?.score);
    const engS = validateScore(scores.engagement?.score);
    const structS = validateScore(scores.structure?.score);

    // Calculate server-side — never trust AI's overall_score
    const overallScore = calculateOverall(hookS, readS, engS, structS);

    // 7. Return result immediately — don't make user wait for DB
    const resultData = result as any;
    const responseData = {
      ...resultData,
      scores: {
        hook: {
          score: hookS,
          label: scores.hook?.label || "",
          explanation: scores.hook?.explanation || "",
        },
        readability: {
          score: readS,
          label: scores.readability?.label || "",
          explanation: scores.readability?.explanation || "",
        },
        engagement: {
          score: engS,
          label: scores.engagement?.label || "",
          explanation: scores.engagement?.explanation || "",
        },
        structure: {
          score: structS,
          label: scores.structure?.label || "",
          explanation: scores.structure?.explanation || "",
        },
      },
      overall_score: overallScore,
    };

    // 8. Save to history in background (don't block response)
    void (async () => {
      try {
        const { error: saveError } = await supabase.from("posts").insert({
          user_id: user.id,
          type: "analyzed",
          original_content: post,
          improved_content: resultData.improved_post || null,
          top_problems: resultData.top_problems || [],
          improvement_summary: resultData.improvement_summary || null,
          hook_score: hookS,
          readability_score: readS,
          engagement_score: engS,
          structure_score: structS,
          overall_score: overallScore,
        });
        if (saveError) console.error("Background save error:", saveError);
      } catch (error) {
        console.error("Background save exception:", error);
      }

      // 9. Update streak in background
      try {
        const { updateUserStreak } = await import("@/lib/supabase/streak");
        await updateUserStreak(supabase, user.id);
      } catch (error) {
        console.error("Background streak update error:", error);
      }
    })();

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
