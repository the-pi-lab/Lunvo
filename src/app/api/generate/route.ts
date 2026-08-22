import { NextRequest, NextResponse } from "next/server";
import { callAI, parseAIJson } from "../../../lib/ai/router";
import { LINKEDIN_SYSTEM_PROMPT, buildGeneratePrompt, AI_CONFIG } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import { predictEngagementRate } from "@/lib/ai/scoringEngine";
import { fetchCurrentsNewsByKeyword } from "@/lib/news/currentsService";
import { searchTrendingArticles } from "@/lib/rss/searchService";

interface NewsContext {
  title?: string;
  description?: string;
  source?: string;
  link?: string;
  date?: string;
}

function cleanText(text: string | undefined | null): string {
  if (!text) {
    return "";
  }

  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeNewsContext(input: NewsContext | null | undefined): NewsContext | null {
  if (!input) {
    return null;
  }

  const title = cleanText(input.title);
  const description = cleanText(input.description);
  const source = cleanText(input.source);
  const link = cleanText(input.link);
  const date = cleanText(input.date);

  if (!title && !description) {
    return null;
  }

  return {
    title: title || description,
    description: description || title,
    source: source || "News Source",
    link,
    date,
  };
}

function appendNewsContextToPrompt(basePrompt: string, newsContext: NewsContext | null): string {
  if (!newsContext) {
    return basePrompt;
  }

  const lines = [
    "",
    "VERIFIED NEWS CONTEXT (USE THESE FACTS IN THE POST):",
    `Headline: ${newsContext.title || "N/A"}`,
    `Summary: ${newsContext.description || "N/A"}`,
    `Source: ${newsContext.source || "N/A"}`,
  ];

  if (newsContext.link) {
    lines.push(`URL: ${newsContext.link}`);
  }

  lines.push("Instructions: Keep claims grounded in the context above. Do not invent facts or numbers.");

  return `${basePrompt}\n${lines.join("\n")}`;
}

async function resolveNewsContext(topic: string, providedNews: NewsContext | null): Promise<NewsContext | null> {
  if (providedNews) {
    return providedNews;
  }

  const currentsArticles = await fetchCurrentsNewsByKeyword(topic, 5).catch(() => []);
  if (currentsArticles.length > 0) {
    const article = currentsArticles[0];
    return {
      title: article.title,
      description: article.description,
      source: article.source,
      link: article.link,
      date: article.date,
    };
  }

  const fallbackResults = await searchTrendingArticles(topic, 5).catch(() => ({ articles: [] }));
  if (fallbackResults.articles.length > 0) {
    const article = fallbackResults.articles[0];
    return {
      title: article.title,
      description: article.description,
      source: article.source,
      link: article.link,
      date: article.date,
    };
  }

  return null;
}

// Helper to validate and clamp scores to 0-10 range
function validateScore(score: any): number {
  const num = parseInt(score) || 0;
  return Math.max(0, Math.min(10, num));
}

export async function POST(req: NextRequest) {
  try {
    const customKeys = {
      gemini: req.headers.get("x-gemini-key") || undefined,
      groq: req.headers.get("x-groq-key") || undefined,
    };
    const body = await req.json();
    const topic = cleanText(body?.topic);
    const providedNews = normalizeNewsContext(body?.news);

    if (!topic || topic.length < 5) {
      return NextResponse.json(
        { error: "Topic is too short (min 5 characters)" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch User Data & Persona
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    const userPlan = (userData.plan as any) || "free";

    const { data: limitCheck, error: limitError } = await supabase
      .rpc("check_and_increment_generate", {
        p_user_id: user.id,
        p_plan: userPlan,
      });

    if (limitError) {
      console.error("Limit check error:", limitError);
      return NextResponse.json({ error: "Service error" }, { status: 500 });
    }

    let limitResult = limitCheck as { allowed: boolean; used: number; limit: number };

    // Backward-compatibility fallback:
    // If DB still has the old free limit (1/day), allow second generation/day here.
    if (userPlan === "free" && !limitResult.allowed && limitResult.limit === 1) {
      const { data: usageRow, error: usageError } = await supabase
        .from("users")
        .select("daily_generate_count")
        .eq("id", user.id)
        .single();

      if (!usageError) {
        const currentCount = usageRow?.daily_generate_count ?? 0;
        if (currentCount < 2) {
          const { error: bumpError } = await supabase
            .from("users")
            .update({ daily_generate_count: currentCount + 1 })
            .eq("id", user.id);

          if (!bumpError) {
            limitResult = {
              allowed: true,
              used: currentCount + 1,
              limit: 2,
            };
          }
        }
      }
    }

    if (!limitResult.allowed) {
      return NextResponse.json(
        {
          error: "daily_limit_reached",
          message: `You've used all ${limitResult.limit} generations for today.`,
          used: limitResult.used,
          limit: limitResult.limit,
          resets_at: "midnight UTC",
        },
        { status: 429 }
      );
    }

    const { data: persona, error: personaError } = await supabase
      .from("personas")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (personaError || !persona) {
      return NextResponse.json(
        { error: "Persona not set up", message: "Please complete your profile first." },
        { status: 400 }
      );
    }

    // 2. Build Prompt with optional news context and Call AI
    const resolvedNewsContext = await resolveNewsContext(topic, providedNews);

    const basePrompt = buildGeneratePrompt(
      topic,
      persona.role,
      persona.topics,
      persona.goal,
      persona.tone,
      persona.audience
    );

    const userPrompt = appendNewsContextToPrompt(basePrompt, resolvedNewsContext);

    const rawResponse = await callAI(
      LINKEDIN_SYSTEM_PROMPT,
      userPrompt,
      userPlan,
      AI_CONFIG.temperature.generate,
      AI_CONFIG.max_tokens.generate,
      customKeys
    );

    // 3. Parse JSON response
    const result = parseAIJson(rawResponse);
    const post = (result as any).post || "";
    const hookType = (result as any).hook_type || "generic";
    const hashtagsFromAI = (result as any).suggested_hashtags || [];

    // 4. CALCULATE REALISTIC ENGAGEMENT PREDICTION
    // (Based on real LinkedIn data, not subjective structure scoring)
    const postMetrics = {
      contentLength: post.length,
      hasHashtags: hashtagsFromAI.length > 0,
      hashtagCount: hashtagsFromAI.length,
      postType: "text" as const, // Default for text posts from AI
      dayOfWeek: new Date().toLocaleDateString("en-US", { weekday: "long" }),
      postHour: new Date().getHours(),
      hasMedia: false,
      hookType: hookType,
      hookQuality: 8, // AI generated hooks are usually strong
      ctaSpecificity: 8, // Our new prompts enforce specific CTAs
      emotionalIndex: 7,
    };

    const engagementPrediction = predictEngagementRate(postMetrics);

    // Convert to database scores (for compatibility with existing system)
    // These are NOW realistic predictions, not fake structural scores
    const hookS = Math.round(engagementPrediction.breakdown.hookScore);
    const readS = Math.round(engagementPrediction.breakdown.contentLengthScore);
    const engS = Math.round(engagementPrediction.breakdown.postTypeScore);
    const structS = Math.round(engagementPrediction.breakdown.timingScore);
    const overallScore = engagementPrediction.predictedEngagementRate;

    // 5. Save to history FIRST
    const { error: saveError } = await supabase.from("posts").insert({
      user_id: user.id,
      type: "generated",
      topic: topic,
      improved_content: post,
      hook_score: hookS,
      readability_score: readS,
      engagement_score: engS,
      structure_score: structS,
      overall_score: overallScore,
    });

    if (saveError) {
      console.error("Post save error:", saveError);
      return NextResponse.json({ error: "Failed to save generated post" }, { status: 500 });
    }

    // 6. Update Streak
    const { updateUserStreak } = await import("@/lib/supabase/streak");
    await updateUserStreak(supabase, user.id);

    // 7. Return enhanced response with engagement insights
    const responsePayload = {
      post: (result as any).post,
      hook_type: (result as any).hook_type,
      suggested_hashtags: (result as any).suggested_hashtags,
      best_time_to_post: (result as any).best_time_to_post,
      news_context: resolvedNewsContext,
      estimated_scores: {
        hook: hookS,
        readability: readS,
        engagement: engS,
        structure: structS,
      },
      // New engagement prediction system
      predictedEngagementRate: engagementPrediction.predictedEngagementRate,
      engagementPredictionConfidence: engagementPrediction.confidence,
      engagementInsights: engagementPrediction.insights,
      engagementRecommendation: engagementPrediction.recommendation,
    };

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error("Generation API Error:", error);

    const message = typeof error?.message === "string" ? error.message : "Generation failed";
    const lowered = message.toLowerCase();

    if (lowered.includes("no ai provider configured") || lowered.includes("api key")) {
      return NextResponse.json(
        {
          error: "ai_provider_missing",
          message: "AI service is not configured properly. Please contact support.",
        },
        { status: 503 }
      );
    }

    if (lowered.includes("rate limit") || lowered.includes("429")) {
      return NextResponse.json(
        {
          error: "ai_rate_limited",
          message: "AI provider rate limit reached. Please retry after a short wait.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate post. Please try again.", message },
      { status: 500 }
    );
  }
}
