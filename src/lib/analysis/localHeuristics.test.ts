import { describe, it, expect } from "vitest";
import { analyzeLocally } from "./localHeuristics";

describe("analyzeLocally", () => {
  it("returns zeros for empty input", () => {
    const result = analyzeLocally("");
    expect(result.overall_score).toBe(0);
    expect(result.scores.hook.score).toBe(0);
  });

  it("punishes cliché opener with low hook score", () => {
    const weak =
      "I am thrilled to share that I got promoted!\n\nHard work always pays off.\n\nKeep grinding everyone! #motivation";
    const result = analyzeLocally(weak);
    expect(result.scores.hook.score).toBeLessThanOrEqual(3);
  });

  it("rewards number-backed hook", () => {
    const strong =
      "84 cold DMs. 3 replies. Here is what I changed.\n\nI stopped pitching in message one.\n\nInstead I asked about their biggest blocker and listened.\n\nReplies tripled in two weeks.\n\nWhat is the one thing you wish you knew before your first cold outreach?";
    const result = analyzeLocally(strong);
    expect(result.scores.hook.score).toBeGreaterThanOrEqual(7);
  });

  it("detects wall of text as weak readability", () => {
    const wall = Array(10).fill("this is a long sentence without any breaks at all").join(" ");
    const result = analyzeLocally(wall);
    expect(result.scores.readability.score).toBeLessThanOrEqual(4);
  });

  it("rewards ending question for engagement", () => {
    const withCta =
      "Most advice online is recycled noise.\n\nI tested 12 posting formats for 90 days.\n\nOnly two consistently worked: story + specific number.\n\nEverything else was vanity.\n\nWhat would you change if you had to restart today?";
    const result = analyzeLocally(withCta);
    expect(result.scores.engagement.score).toBeGreaterThanOrEqual(6);
  });

  it("penalises hashtag spam", () => {
    const spam =
      "Great news today team.\n\nWe shipped something big and the journey was amazing.\n\n#startup #hustle #growth #grind #success #linkedin";
    const result = analyzeLocally(spam);
    expect(result.scores.engagement.explanation.toLowerCase()).toContain("hashtag");
  });

  it("keeps all scores within 0-10", () => {
    const weird = "#\n\n\n???";
    const result = analyzeLocally(weird);
    const values = Object.values(result.scores).map((s) => s.score);
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    });
  });
});
