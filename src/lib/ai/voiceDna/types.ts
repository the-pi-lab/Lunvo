export interface VoiceDNA {
  id: string; // usually tied to a user_id
  tone: string[]; // e.g., ["casual", "authoritative", "storyteller"]
  formatting_preferences: {
    uses_bullet_points: boolean;
    paragraph_length: "short" | "medium" | "long" | "mixed";
    emoji_frequency: "none" | "low" | "high";
    capitalization_style: "standard" | "all_caps_headers" | "lowercase_aesthetic";
    hook_style: string; // e.g., "starts with a question", "starts with a bold statement"
  };
  vocabulary: {
    commonly_used_words: string[];
    banned_words: string[]; // e.g., corporate jargon they hate
  };
  sentence_structure: "simple" | "complex" | "mixed";
  last_updated: string;
}

export interface IngestedPost {
  id: string;
  content: string;
  date_added: string;
}

export interface ExtractionResult {
  voiceDNA: Omit<VoiceDNA, "id" | "last_updated">;
  confidenceScore: number; // 0 to 1
}
