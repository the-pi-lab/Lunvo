import { describe, it, expect } from "vitest";
import { fetchAvailableModels } from "./dynamicModelDiscovery";

describe("LUNVO 2.0 Dynamic AI Model Discovery Engine", () => {
  it("returns fallback registry models when no API key is provided", async () => {
    const models = await fetchAvailableModels("groq", "");
    expect(models.length).toBeGreaterThan(0);
    expect(models.some((m) => m.id.includes("llama"))).toBe(true);
  });

  it("handles Gemini models mapping accurately", async () => {
    const models = await fetchAvailableModels("gemini", "");
    expect(models.length).toBeGreaterThan(0);
    expect(models.some((m) => m.id.includes("gemini"))).toBe(true);
  });

  it("handles OpenAI models mapping accurately", async () => {
    const models = await fetchAvailableModels("openai", "");
    expect(models.length).toBeGreaterThan(0);
    expect(models.some((m) => m.id.includes("gpt"))).toBe(true);
  });
});
