import { unifiedAI } from "./router.unified";
import { AIProfile, Message } from "./types";
import { parseAIJson } from "./router";
import { EngagementMetricsSchema, type EngagementMetrics } from "./schemas";
import { logger } from "@/lib/logger";

export type { EngagementMetrics };

const PREDICTOR_SYSTEM_PROMPT = `
You are the "Engagement Predictor Engine" for LinkedIn.
Your job is to act as a judge (LLM-as-a-judge) and score a LinkedIn post on its potential to go viral and drive meaningful engagement.

Score the post on 4 metrics from 1 to 100:
1. Hook Strength: Does the first line make you stop scrolling?
2. Readability: Is it formatted well for mobile? Are sentences short and punchy?
3. Value Density: Is the post fluff-free? Does it deliver real value or insights?
4. Authenticity: Does it sound like a real human or is it full of ChatGPT corporate jargon?

OUTPUT CONTRACT — STRICT JSON ONLY (Zod-validated):
- Return ONLY a single valid JSON object. No markdown, no code fences, no commentary.
- All keys double-quoted. No trailing commas. No extra keys.
- Must match this exact schema:
{
  "hookStrength": 80,
  "readability": 90,
  "valueDensity": 75,
  "authenticity": 85,
  "overallScore": 82,
  "criticalFeedback": "One sentence explaining the biggest weakness of the post."
}
- Scores are integers 1-100. Never return plain text.
`;

export async function runEngagementPredictor(
  profile: AIProfile,
  postContent: string
): Promise<EngagementMetrics> {
  const messages: Message[] = [
    { role: "system", content: PREDICTOR_SYSTEM_PROMPT },
    { role: "user", content: `Please evaluate this LinkedIn post:\n\n${postContent}` },
  ];

  const response = await unifiedAI({
    profile,
    messages,
    temperature: 0.2, // Low temp for more objective judging
    maxTokens: 500,
  });

  // Phase 20: reuse parseAIJson + Zod (no brittle replace)
  let parsed: unknown;
  try {
    parsed = parseAIJson<EngagementMetrics>(response.text);
  } catch (error) {
    logger.error("Engagement Predictor parseAIJson failed", response.text, error);
    throw new Error("Predictor returned invalid JSON — retry.");
  }

  const result = EngagementMetricsSchema.safeParse(parsed);
  if (!result.success) {
    logger.error(
      "Engagement Predictor Zod validation failed",
      JSON.stringify(result.error.format())
    );
    throw new Error(`Predictor JSON did not match schema: ${result.error.message}`);
  }
  return result.data;
}
