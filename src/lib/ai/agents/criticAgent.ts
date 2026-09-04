import { unifiedAI } from "../router.unified";
import { AIProfile, Message } from "../types";
import { parseAIJson } from "../router";
import { CriticResultSchema, type CriticResult } from "../schemas";
import { logger } from "@/lib/logger";

export type { CriticResult };

const CRITIC_SYSTEM_PROMPT = `
You are the "Critic Agent" in a 3-part AI content pipeline for LinkedIn.
Your job is to audit the drafted post from the Writer Agent and optimize it for LinkedIn's algorithm and reading experience.

Look for:
- Hook punchiness (Is it a scroll-stopper?)
- White space and readability (Mobile-friendly formatting)
- Fluff (Cut unnecessary words)
- Call to Action clarity

OUTPUT CONTRACT — STRICT JSON ONLY (Zod-validated):
- Return ONLY a single valid JSON object. No markdown, no code fences, no commentary.
- All keys double-quoted. No trailing commas. No extra keys.
- Must match this exact schema:
{
  "improvedPost": "The final edited and optimized version of the post",
  "critiqueNotes": ["Fixed X to be punchier", "Added white space at Y for readability"],
  "finalScore": 85
}
- finalScore is integer 1-100. improvedPost must be >=20 chars. Never return plain text.
`;

export async function runCriticAgent(
  profile: AIProfile,
  draftPost: string,
  opts?: import("./scoutAgent").AgentRunOpts
): Promise<CriticResult> {
  const extra = opts?.customPrompt?.trim().slice(0, 1000);
  const messages: Message[] = [
    {
      role: "system",
      content: extra
        ? `${CRITIC_SYSTEM_PROMPT}\n\nAdditional user instruction for this step (you MUST still obey the OUTPUT CONTRACT above exactly):\n${extra}`
        : CRITIC_SYSTEM_PROMPT,
    },
    { role: "user", content: `Please review and optimize this draft:\n\n${draftPost}` },
  ];

  const response = await unifiedAI({
    profile,
    messages,
    temperature: opts?.temperature ?? 0.5, // Lower temp for more analytical edits
    maxTokens: 1500,
  });

  // Phase 20: reuse parseAIJson + Zod (no brittle replace)
  let parsed: unknown;
  try {
    parsed = parseAIJson<CriticResult>(response.text);
  } catch (error) {
    logger.error("Critic Agent parseAIJson failed", response.text, error);
    throw new Error("Critic agent returned invalid JSON — retry.");
  }

  const result = CriticResultSchema.safeParse(parsed);
  if (!result.success) {
    logger.error("Critic Agent Zod validation failed", JSON.stringify(result.error.format()));
    throw new Error(`Critic agent JSON did not match schema: ${result.error.message}`);
  }
  return result.data;
}
