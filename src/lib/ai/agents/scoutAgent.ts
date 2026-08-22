import { callUniversalAI } from "../universalRouter";
import { AIProfile, Message } from "../types";

export interface ScoutResult {
  topicAngle: string;
  hookIdeas: string[];
  suggestedStructure: string;
  targetAudience: string;
}

const SCOUT_SYSTEM_PROMPT = `
You are the "Scout Agent" in a 3-part AI content pipeline for LinkedIn.
Your job is NOT to write the post. Your job is to analyze the user's raw idea and output a strategic framework.

Analyze the user's topic and generate a JSON response strictly adhering to this format:
{
  "topicAngle": "A unique, contrarian or highly engaging angle on this topic",
  "hookIdeas": ["Hook 1 (Stats/Data based)", "Hook 2 (Story based)", "Hook 3 (Controversial/Bold)"],
  "suggestedStructure": "e.g., Problem -> Agitation -> Solution -> Call to Action",
  "targetAudience": "Who exactly will care about this post?"
}
Do not include markdown or text outside the JSON.
`;

export async function runScoutAgent(
  profile: AIProfile,
  rawTopic: string
): Promise<ScoutResult> {
  const messages: Message[] = [
    { role: 'system', content: SCOUT_SYSTEM_PROMPT },
    { role: 'user', content: `Raw Topic / Idea:\n\n${rawTopic}` }
  ];

  const response = await callUniversalAI(profile, {
    messages,
    temperature: 0.8, // Slightly higher for creativity in angles
    maxTokens: 1000
  });

  try {
    const rawJson = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(rawJson) as ScoutResult;
  } catch (error) {
    console.error("Scout Agent JSON Parse Error:", response.text);
    throw new Error("Scout agent returned invalid formatting.");
  }
}
