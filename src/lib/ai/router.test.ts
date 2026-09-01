import { describe, it, expect } from "vitest";
import { parseAIJson } from "./router";
import { predictEngagementRate } from "./scoringEngine";
import { BANNED_AI_PHRASES } from "./humanizer";

describe("LUNVO 2.0 AI Architecture & Balanced Parser", () => {
  it("parses clean JSON objects", () => {
    const json = '{"title": "AI Trends", "score": 90}';
    const parsed = parseAIJson<{ title: string; score: number }>(json);
    expect(parsed.title).toBe("AI Trends");
    expect(parsed.score).toBe(90);
  });

  it("handles markdown codeblocks wrapped around JSON", () => {
    const wrapped = '```json\n{\n  "hook": "Stop wasting time.",\n  "rating": 9\n}\n```';
    const parsed = parseAIJson<{ hook: string; rating: number }>(wrapped);
    expect(parsed.hook).toBe("Stop wasting time.");
    expect(parsed.rating).toBe(9);
  });

  it("extracts balanced JSON when surrounding conversational text exists", () => {
    const output =
      'Here is the analysis you requested:\n\n{"hookScore": 9.5, "feedback": "Great opening hook {with nested context}!"}\n\nHope this helps!';
    const parsed = parseAIJson<{ hookScore: number; feedback: string }>(output);
    expect(parsed.hookScore).toBe(9.5);
    expect(parsed.feedback).toContain("nested context");
  });

  it("safely handles trailing commas in LLM outputs", () => {
    const trailingCommaJson = '{\n  "tags": ["ai", "tech",],\n  "score": 88,\n}';
    const parsed = parseAIJson<{ tags: string[]; score: number }>(trailingCommaJson);
    expect(parsed.tags.length).toBe(2);
    expect(parsed.score).toBe(88);
  });

  it("verifies BANNED_AI_PHRASES contains exactly 48 canonical clichés", () => {
    expect(BANNED_AI_PHRASES.length).toBe(48);
  });

  it("predicts engagement rate including day of week and post hour", () => {
    const result = predictEngagementRate({
      contentLength: 300,
      hasHashtags: true,
      hashtagCount: 5,
      postType: "video",
      dayOfWeek: "Tuesday",
      postHour: 17, // 5 PM peak
      hasMedia: true,
      hookType: "vulnerability",
    });

    expect(result.predictedEngagementRate).toBeGreaterThan(4);
    expect(result.breakdown.timingScore).toBeGreaterThan(0);
    expect(result.breakdown.postTypeScore).toBeGreaterThan(0);
  });
});
