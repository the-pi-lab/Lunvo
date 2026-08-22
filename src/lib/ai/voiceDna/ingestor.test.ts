import { describe, it, expect } from "vitest";
import { normalizePostText, isPostValidForExtraction } from "./ingestor";

describe("normalizePostText", () => {
  it("trims and normalizes newlines", () => {
    expect(normalizePostText("  hello  \n\n\n world  ")).toBe("hello\n\nworld");
  });

  it("removes zero-width characters", () => {
    expect(normalizePostText("hello\u200Bworld")).toBe("helloworld");
  });

  it("handles empty input", () => {
    expect(normalizePostText("")).toBe("");
    expect(normalizePostText("   ")).toBe("");
  });

  it("preserves single paragraph breaks", () => {
    expect(normalizePostText("para1\n\npara2")).toBe("para1\n\npara2");
  });

  it("collapses 3+ newlines to 2", () => {
    expect(normalizePostText("a\n\n\n\nb")).toBe("a\n\nb");
  });
});

describe("isPostValidForExtraction", () => {
  it("rejects too short posts (<20 words)", () => {
    const short = "Hello world this is short";
    const result = isPostValidForExtraction(short);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("too short");
  });

  it("accepts valid length posts", () => {
    const valid = Array(25).fill("word").join(" ");
    expect(isPostValidForExtraction(valid).valid).toBe(true);
  });

  it("rejects too long posts (>1000 words)", () => {
    const long = Array(1001).fill("word").join(" ");
    const result = isPostValidForExtraction(long);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("too long");
  });
});
