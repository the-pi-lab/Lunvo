import { VoiceDNA } from "./types";
import { Message } from "../types";

export const BASE_SYSTEM_PROMPT = `
You are a top-tier LinkedIn ghostwriter. Your objective is to write highly engaging, insightful, and readable posts.
Always avoid cringe phrasing, corporate jargon, or overly dramatic hook lines unless explicitly requested.
`;

export function injectVoiceDNA(voiceDna: VoiceDNA | null, customInstructions?: string): Message {
  let finalPrompt = BASE_SYSTEM_PROMPT;

  if (voiceDna) {
    finalPrompt += `\n\n--- CRITICAL: VOICE AND STYLE INSTRUCTIONS ---\n`;
    finalPrompt += `You must write EXACTLY in the following style:\n`;
    finalPrompt += `- Tone: ${voiceDna.tone.join(", ")}\n`;
    finalPrompt += `- Sentence Structure: ${voiceDna.sentence_structure}\n`;
    finalPrompt += `- Paragraph Length: ${voiceDna.formatting_preferences.paragraph_length}\n`;
    finalPrompt += `- Emojis: ${voiceDna.formatting_preferences.emoji_frequency}\n`;
    
    if (voiceDna.formatting_preferences.uses_bullet_points) {
      finalPrompt += `- Formatting: Uses bullet points where appropriate.\n`;
    }

    if (voiceDna.vocabulary.commonly_used_words.length > 0) {
      finalPrompt += `- Favorite Vocabulary: Use these words naturally: ${voiceDna.vocabulary.commonly_used_words.join(", ")}\n`;
    }

    if (voiceDna.vocabulary.banned_words.length > 0) {
      finalPrompt += `- BANNED WORDS (DO NOT USE THESE): ${voiceDna.vocabulary.banned_words.join(", ")}\n`;
    }
  }

  if (customInstructions) {
    finalPrompt += `\n\n--- ADDITIONAL INSTRUCTIONS ---\n${customInstructions}`;
  }

  return {
    role: "system",
    content: finalPrompt
  };
}
