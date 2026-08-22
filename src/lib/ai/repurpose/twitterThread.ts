import { callUniversalAI } from "../universalRouter";
import { AIProfile, Message } from "../types";

const TWITTER_SYSTEM_PROMPT = `
You are an expert X (Twitter) ghostwriter.
Your job is to take a LinkedIn post and repurpose it into a highly engaging Twitter Thread.
Follow these strict rules:
1. The first tweet must be a powerful hook that stops the scroll (max 280 characters).
2. Use short, punchy sentences.
3. Number the tweets (e.g., 1/5, 2/5).
4. End the thread with a clear Call to Action (CTA) or summary.
5. Do not include introductory text. Output only the thread, separating each tweet with "---".
`;

export async function repurposeToTwitter(
  profile: AIProfile,
  linkedInPost: string
): Promise<string[]> {
  const messages: Message[] = [
    { role: 'system', content: TWITTER_SYSTEM_PROMPT },
    { role: 'user', content: `Repurpose this LinkedIn post into a Twitter Thread:\n\n${linkedInPost}` }
  ];

  const response = await callUniversalAI(profile, {
    messages,
    temperature: 0.7,
    maxTokens: 1500
  });

  // Split by the "---" separator to return an array of tweets
  const tweets = response.text
    .split('---')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  return tweets;
}
