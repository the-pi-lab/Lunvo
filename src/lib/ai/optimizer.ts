import { callUniversalAI } from "./universalRouter";
import { AIProfile, Message } from "./types";

const OPTIMIZER_SYSTEM_PROMPT = `
You are an expert LinkedIn post editor.
Your job is to rewrite the provided post based EXACTLY on the user's specific feedback or instructions, while maintaining the original core message and intent.
Output ONLY the revised post content. Do not include introductory text, meta-commentary, or markdown code blocks around the text.
`;

export async function runOptimizer(
  profile: AIProfile,
  originalPost: string,
  instruction: string
): Promise<string> {
  const messages: Message[] = [
    { role: 'system', content: OPTIMIZER_SYSTEM_PROMPT },
    { role: 'user', content: `Original Post:\n${originalPost}\n\nRevision Instruction:\n${instruction}` }
  ];

  const response = await callUniversalAI(profile, {
    messages,
    temperature: 0.6,
    maxTokens: 1500
  });

  return response.text.trim();
}
