import { unifiedAI } from "../router.unified";
import { AIProfile, Message } from "../types";

const VIDEO_SCRIPT_SYSTEM_PROMPT = `
You are an expert short-form video scriptwriter (TikTok, Instagram Reels, YouTube Shorts).
Your job is to take a LinkedIn post and convert it into a high-retention 60-second video script.
Follow these strict rules:
1. Start with a visual or verbal hook that immediately grabs attention in the first 3 seconds.
2. Structure the output in a two-column format or clear scene-by-scene format: [VISUAL / B-ROLL] and [AUDIO / DIALOGUE].
3. Keep the language spoken, conversational, and energetic.
4. End with a strong Call to Action (CTA) (e.g., "Follow for more", "Comment your thoughts").
5. Output only the script. Do not include introductory text.
`;

export async function repurposeToVideoScript(
  profile: AIProfile,
  linkedInPost: string
): Promise<string> {
  const messages: Message[] = [
    { role: "system", content: VIDEO_SCRIPT_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Convert this LinkedIn post into a short-form video script:\n\n${linkedInPost}`,
    },
  ];

  const response = await unifiedAI({
    profile,
    messages,
    temperature: 0.7,
    maxTokens: 1000,
  });

  return response.text.trim();
}
