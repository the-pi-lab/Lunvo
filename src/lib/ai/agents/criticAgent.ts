import { unifiedAI } from "../router.unified";
import { AIProfile, Message } from "../types";

export interface CriticResult {
  improvedPost: string;
  critiqueNotes: string[];
  finalScore: number;
}

const CRITIC_SYSTEM_PROMPT = `
You are the "Critic Agent" in a 3-part AI content pipeline for LinkedIn.
Your job is to audit the drafted post from the Writer Agent and optimize it for LinkedIn's algorithm and reading experience.

Look for:
- Hook punchiness (Is it a scroll-stopper?)
- White space and readability (Mobile-friendly formatting)
- Fluff (Cut unnecessary words)
- Call to Action clarity

Output your analysis as a strict JSON object matching this schema:
{
  "improvedPost": "The final edited and optimized version of the post",
  "critiqueNotes": ["Fixed X to be punchier", "Added white space at Y for readability"],
  "finalScore": 85 // A number from 1 to 100 on how viral/engaging it is
}
Do not include markdown or text outside the JSON.
`;

export async function runCriticAgent(profile: AIProfile, draftPost: string): Promise<CriticResult> {
  const messages: Message[] = [
    { role: "system", content: CRITIC_SYSTEM_PROMPT },
    { role: "user", content: `Please review and optimize this draft:\n\n${draftPost}` },
  ];

  const response = await unifiedAI({
    profile,
    messages,
    temperature: 0.5, // Lower temp for more analytical edits
    maxTokens: 1500,
  });

  try {
    const rawJson = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(rawJson) as CriticResult;
  } catch (error) {
    console.error("Critic Agent JSON Parse Error:", response.text);
    throw new Error("Critic agent returned invalid formatting.");
  }
}
