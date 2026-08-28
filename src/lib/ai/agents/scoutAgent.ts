import { unifiedAI } from "../router.unified";
import { AIProfile, Message } from "../types";
import { parseAIJson } from "../router";
import { ScoutResultSchema, type ScoutResult } from "../schemas";
import { logger } from "@/lib/logger";

export type { ScoutResult };

const SCOUT_SYSTEM_PROMPT = `
You are the "Scout Agent" in a 3-part AI content pipeline for LinkedIn.
Your job is NOT to write the post. Your job is to analyze the user's raw idea and output a strategic framework.

OUTPUT CONTRACT — STRICT JSON ONLY (Zod-validated):
- Return ONLY a single valid JSON object. No markdown, no code fences, no commentary.
- All keys double-quoted. No trailing commas. No extra keys.
- Must match this exact schema:
{
  "topicAngle": "A unique, contrarian or highly engaging angle on this topic",
  "hookIdeas": ["Hook 1 (Stats/Data based)", "Hook 2 (Story based)", "Hook 3 (Controversial/Bold)"],
  "suggestedStructure": "e.g., Problem -> Agitation -> Solution -> Call to Action",
  "targetAudience": "Who exactly will care about this post?"
}
- hookIdeas must be exactly 3 strings, each >=10 chars. Never return plain text.
`;

export async function runScoutAgent(
  profile: AIProfile,
  rawTopic: string,
  newsContext?: string
): Promise<ScoutResult> {
  const userContent = newsContext
    ? `Raw Topic / Idea:\n\n${rawTopic}\n\n--- Trending context (for angle inspiration, do not copy verbatim) ---\n${newsContext}`
    : `Raw Topic / Idea:\n\n${rawTopic}`;

  const messages: Message[] = [
    { role: "system", content: SCOUT_SYSTEM_PROMPT },
    { role: "user", content: userContent },
  ];

  const response = await unifiedAI({
    profile,
    messages,
    temperature: 0.8, // Slightly higher for creativity in angles
    maxTokens: 1000,
  });

  // Phase 20: reuse parseAIJson + Zod (no brittle replace)
  let parsed: unknown;
  try {
    parsed = parseAIJson<ScoutResult>(response.text);
  } catch (error) {
    logger.error("Scout Agent parseAIJson failed", response.text, error);
    throw new Error("Scout agent returned invalid JSON — retry.");
  }

  const result = ScoutResultSchema.safeParse(parsed);
  if (!result.success) {
    logger.error("Scout Agent Zod validation failed", JSON.stringify(result.error.format()));
    throw new Error(`Scout agent JSON did not match schema: ${result.error.message}`);
  }
  return result.data;
}
