import { callUniversalAI } from "../universalRouter";
import { AIProfile, Message } from "../types";
import { VoiceDNA } from "../voiceDna/types";
import { injectVoiceDNA } from "../voiceDna/injector";
import { ScoutResult } from "./scoutAgent";

const WRITER_SYSTEM_PROMPT = `
You are the "Writer Agent" in a 3-part AI content pipeline for LinkedIn.
Your job is to take the strategic framework created by the Scout Agent, along with the user's raw idea, and write the actual LinkedIn post.
You must absolutely follow the injected Voice DNA guidelines to ensure the post sounds exactly like the user.
Do not use hashtags unless the Voice DNA explicitly encourages them.
Output ONLY the post content. Do not include introductory text, meta-commentary, or markdown code blocks around the text.
`;

export async function runWriterAgent(
  profile: AIProfile,
  rawTopic: string,
  scoutResult: ScoutResult,
  voiceDna: VoiceDNA | null
): Promise<string> {
  // Inject the user's voice into the system prompt
  const systemMessage = injectVoiceDNA(voiceDna, WRITER_SYSTEM_PROMPT);

  const promptContent = `
Raw Topic / Idea from User:
${rawTopic}

---
Strategic Framework from Scout Agent:
- Target Audience: ${scoutResult.targetAudience}
- Angle: ${scoutResult.topicAngle}
- Chosen Hook: ${scoutResult.hookIdeas[0]} (Feel free to adapt it)
- Suggested Structure: ${scoutResult.suggestedStructure}

Write the final LinkedIn post now. Output ONLY the post content.
  `;

  const messages: Message[] = [
    systemMessage,
    { role: 'user', content: promptContent }
  ];

  const response = await callUniversalAI(profile, {
    messages,
    temperature: 0.7,
    maxTokens: 1500
  });

  return response.text.trim();
}
