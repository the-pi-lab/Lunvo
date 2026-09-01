import { describe, it, expect } from "vitest";
import { analyzeLocally } from "../lib/analysis/localHeuristics";
import { humanizeLocal, isHumanScore } from "../lib/ai/humanizer";
import { PREBUILT_WORKFLOWS } from "../lib/workflow/templates";

describe("LUNVO 2.0 Headless MCP Server Tools", () => {
  it("executes local heuristic audit for analyze_draft tool", () => {
    const samplePost =
      "Most developers misunderstand system architecture.\n\nHere are 3 rules we learned:\n1. Keep state local\n2. Automate quality gates\n3. Reduce unnecessary dependencies\n\nWhat is your take?";
    const analysis = analyzeLocally(samplePost);
    expect(analysis.overall_score).toBeGreaterThan(5);
    expect(analysis.scores.hook).toBeDefined();
    expect(analysis.scores.readability).toBeDefined();
  });

  it("executes humanize_post tool cleaning AI clichés and calculating human score", () => {
    const raw =
      "Let us delve into the intricate tapestry of modern tech solutions and synergize our efforts.";
    const cleaned = humanizeLocal(raw);
    const score = isHumanScore(cleaned);

    expect(cleaned).not.toContain("delve");
    expect(cleaned).not.toContain("tapestry");
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it("ensures all 12 prebuilt workflows are available for execute_workflow tool", () => {
    expect(PREBUILT_WORKFLOWS.length).toBe(12);
    const ids = PREBUILT_WORKFLOWS.map((w) => w.metadata.id);
    expect(ids).toContain("rss-tech-trends");
    expect(ids).toContain("youtube-repurposer");
    expect(ids).toContain("quality-gatekeeper");
    expect(ids).toContain("classic-3agent-storyteller");
  });
});
