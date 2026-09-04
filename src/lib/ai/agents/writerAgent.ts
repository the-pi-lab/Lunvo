import { unifiedAI } from "../router.unified";
import { AIProfile, Message } from "../types";
import { VoiceDNA } from "../voiceDna/types";
import { injectVoiceDNA } from "../voiceDna/injector";
import { ScoutResult } from "./scoutAgent";
import { z } from "zod";
import { logger } from "@/lib/logger";

const WRITER_SYSTEM_PROMPT = `
You are the "Writer Agent" in a 3-part AI content pipeline for LinkedIn.
Your job is to take the strategic framework created by the Scout Agent, along with the user's raw idea, and write the actual LinkedIn post.
You must absolutely follow the injected Voice DNA guidelines to ensure the post sounds exactly like the user.
Do not use hashtags unless the Voice DNA explicitly encourages them.

OUTPUT CONTRACT:
- Output ONLY the post content. No JSON, no markdown code fences, no commentary.
- Plain text with \\n for breaks. Never wrap in \`\`\`.
`;

export async function runWriterAgent(
  profile: AIProfile,
  rawTopic: string,
  scoutResult: ScoutResult,
  voiceDna: VoiceDNA | null,
  onChunk?: (chunk: string, fullText: string) => void,
  opts?: import("./scoutAgent").AgentRunOpts
): Promise<string> {
  // Inject the user's voice into the system prompt (+ optional node customPrompt)
  const systemMessage = injectVoiceDNA(voiceDna, WRITER_SYSTEM_PROMPT);
  const extra = opts?.customPrompt?.trim().slice(0, 1000);
  if (extra) {
    systemMessage.content += `\n\nAdditional user instruction for this step (plain-text post output still required):\n${extra}`;
  }
  const temperature = opts?.temperature ?? 0.7;

  const promptContent = `
Raw Topic / Idea from User:
${rawTopic}

---
Strategic Framework from Scout Agent:
- Target Audience: ${scoutResult.targetAudience}
- Angle: ${scoutResult.topicAngle}
- Chosen Hook: ${scoutResult.hookIdeas?.[0] || "Engage reader with a bold premise"} (Feel free to adapt it)
- Suggested Structure: ${scoutResult.suggestedStructure}

Write the final LinkedIn post now. Output ONLY the post content.
  `;

  const messages: Message[] = [systemMessage, { role: "user", content: promptContent }];

  // Phase 23: streaming word-by-word if onChunk provided
  if (onChunk) {
    let full = "";
    const response = await unifiedAI({
      profile,
      messages,
      temperature,
      maxTokens: 1500,
      stream: true,
      onChunk: (c) => {
        if (!c.isDone) {
          full += c.text;
          onChunk(c.text, full);
        }
      },
    });
    // fallback if provider didn't stream (unifiedAI returns full text anyway)
    if (full.length === 0) {
      full = response.text;
      // simulate word-by-word for UI consistency
      const words = full.split(/(\s+)/);
      let acc = "";
      for (const w of words) {
        acc += w;
        onChunk(w, acc);
        // tiny yield
      }
    }
    let text = full.trim();
    if (text.startsWith("```")) {
      text = text
        .replace(/^```(?:\w+)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    }
    const WriterSchema = z.string().min(20, "Writer output too short");
    const parsed = WriterSchema.safeParse(text);
    if (!parsed.success) {
      logger.error("Writer Agent Zod validation failed", text.slice(0, 200));
      throw new Error(`Writer agent output did not match schema: ${parsed.error.message}`);
    }
    return parsed.data.trim();
  }

  const response = await unifiedAI({
    profile,
    messages,
    temperature,
    maxTokens: 1500,
  });

  // Phase 20: Zod validate plain text (no brittle JSON, but ensure non-empty and strip fences if AI slipped)
  let text = response.text.trim();
  // Defensive: if model wrapped in fences, strip (parseAIJson would do, but we keep minimal)
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:\w+)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const WriterSchema = z.string().min(20, "Writer output too short");
  const parsed = WriterSchema.safeParse(text);
  if (!parsed.success) {
    logger.error("Writer Agent Zod validation failed", text.slice(0, 200));
    throw new Error(`Writer agent output did not match schema: ${parsed.error.message}`);
  }
  return parsed.data.trim();
}
