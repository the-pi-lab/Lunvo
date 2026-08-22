import { callUniversalAI } from "./universalRouter";
import { AIProfile, Message } from "./types";

export interface EngagementMetrics {
  hookStrength: number;
  readability: number;
  valueDensity: number;
  authenticity: number;
  overallScore: number;
  criticalFeedback: string;
}

const PREDICTOR_SYSTEM_PROMPT = `
You are the "Engagement Predictor Engine" for LinkedIn.
Your job is to act as a judge (LLM-as-a-judge) and score a LinkedIn post on its potential to go viral and drive meaningful engagement.

Score the post on 4 metrics from 1 to 100:
1. Hook Strength: Does the first line make you stop scrolling?
2. Readability: Is it formatted well for mobile? Are sentences short and punchy?
3. Value Density: Is the post fluff-free? Does it deliver real value or insights?
4. Authenticity: Does it sound like a real human or is it full of ChatGPT corporate jargon?

Output your analysis strictly as a JSON object:
{
  "hookStrength": 80,
  "readability": 90,
  "valueDensity": 75,
  "authenticity": 85,
  "overallScore": 82,
  "criticalFeedback": "One sentence explaining the biggest weakness of the post."
}
Do not include any text outside the JSON block.
`;

export async function runEngagementPredictor(
  profile: AIProfile,
  postContent: string
): Promise<EngagementMetrics> {
  const messages: Message[] = [
    { role: 'system', content: PREDICTOR_SYSTEM_PROMPT },
    { role: 'user', content: `Please evaluate this LinkedIn post:\n\n${postContent}` }
  ];

  const response = await callUniversalAI(profile, {
    messages,
    temperature: 0.2, // Low temp for more objective judging
    maxTokens: 500
  });

  try {
    const rawJson = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(rawJson) as EngagementMetrics;
  } catch (error) {
    console.error("Engagement Predictor JSON Parse Error:", response.text);
    throw new Error("Predictor returned invalid formatting.");
  }
}
