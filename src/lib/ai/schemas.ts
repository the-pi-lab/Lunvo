/**
 * Phase 20 — Zod Schemas (Prompts V3)
 * Strict validation for all agent JSON outputs.
 * Ensures 100 gens 0 JSON error by catching malformed AI responses
 * and surfacing typed errors instead of brittle JSON.parse crashes.
 */
import { z } from "zod";

// --- Scout ---

export const ScoutResultSchema = z
  .object({
    topicAngle: z.string().min(10, "topicAngle too short"),
    hookIdeas: z
      .array(z.string().min(10, "hook idea too short"))
      .length(3, "exactly 3 hook ideas required"),
    suggestedStructure: z.string().min(5, "suggestedStructure too short"),
    targetAudience: z.string().min(5, "targetAudience too short"),
  })
  .strict();

export type ScoutResult = z.infer<typeof ScoutResultSchema>;

// --- Critic ---

export const CriticResultSchema = z
  .object({
    improvedPost: z.string().min(20, "improvedPost too short"),
    critiqueNotes: z
      .array(z.string().min(5, "critique note too short"))
      .min(1, "at least 1 critique note")
      .max(5, "too many critique notes"),
    finalScore: z.number().int().min(1).max(100),
  })
  .strict();

export type CriticResult = z.infer<typeof CriticResultSchema>;

// --- Analyze (prompts.ts buildAnalyzePrompt) ---

export const AnalyzeScoreSchema = z
  .object({
    score: z.number().min(0).max(10),
    label: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          const trimmed = val.trim();
          return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        }
        return val;
      },
      z.enum(["Weak", "Good", "Elite"])
    ),
    explanation: z.string().min(5),
  })
  .strict();

export const AnalyzeResultSchema = z
  .object({
    scores: z
      .object({
        hook: AnalyzeScoreSchema,
        readability: AnalyzeScoreSchema,
        engagement: AnalyzeScoreSchema,
        structure: AnalyzeScoreSchema,
      })
      .strict(),
    overall_score: z.number().min(0).max(10),
    top_problems: z.array(z.string()).min(1).max(5),
    improved_post: z.string().min(20),
    improvement_summary: z.string().min(5),
  })
  .strict();

export type AnalyzeResult = z.infer<typeof AnalyzeResultSchema>;

// --- Engagement Predictor ---

export const EngagementMetricsSchema = z
  .object({
    hookStrength: z.number().min(1).max(100),
    readability: z.number().min(1).max(100),
    valueDensity: z.number().min(1).max(100),
    authenticity: z.number().min(1).max(100),
    overallScore: z.number().min(1).max(100),
    criticalFeedback: z.string().min(5),
  })
  .strict();

export type EngagementMetrics = z.infer<typeof EngagementMetricsSchema>;

// --- Generate (prompts.ts buildGeneratePrompt) ---

export const GenerateResultSchema = z
  .object({
    post: z.string().min(20),
    hook_type: z.enum([
      "bold_claim",
      "vulnerability",
      "curiosity_gap",
      "contrarian",
      "number_backed",
      "question",
      "scene",
    ]),
    estimated_scores: z
      .object({
        hook: z.number().min(0).max(10),
        readability: z.number().min(0).max(10),
        engagement: z.number().min(0).max(10),
        structure: z.number().min(0).max(10),
      })
      .strict(),
    best_time_to_post: z.string().min(3),
    suggested_hashtags: z.array(z.string()).min(1).max(6),
  })
  .strict();

export type GenerateResult = z.infer<typeof GenerateResultSchema>;
