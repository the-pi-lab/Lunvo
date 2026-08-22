import { callUniversalAI } from "../universalRouter";
import { AIProfile, Message } from "../types";

const NEWSLETTER_SYSTEM_PROMPT = `
You are an expert long-form content writer and Substack author.
Your job is to take a short LinkedIn post and expand it into a comprehensive, engaging newsletter edition or blog post.
Follow these strict rules:
1. Maintain the core message but add deeper context, examples, and actionable takeaways.
2. Structure the newsletter with an engaging Title, an Introduction, 2-3 main sections with subheadings, and a Conclusion.
3. Use Markdown formatting for headers (##, ###) and emphasis.
4. Output only the newsletter content. Do not include introductory text.
`;

export async function repurposeToNewsletter(
  profile: AIProfile,
  linkedInPost: string
): Promise<string> {
  const messages: Message[] = [
    { role: 'system', content: NEWSLETTER_SYSTEM_PROMPT },
    { role: 'user', content: `Expand this LinkedIn post into a detailed Newsletter:\n\n${linkedInPost}` }
  ];

  const response = await callUniversalAI(profile, {
    messages,
    temperature: 0.7,
    maxTokens: 2500 // Higher token limit for long-form
  });

  return response.text.trim();
}
