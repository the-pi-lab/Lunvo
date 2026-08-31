import { describe, it, expect, vi } from "vitest";
import { PREBUILT_WORKFLOWS } from "./templates";
import { executeWorkflow } from "./workflowRunner";
import {
  getAllWorkflows,
  getWorkflowById,
  exportWorkflowToJson,
  importWorkflowFromJson,
} from "./workflowStore";
import type { AIProfile } from "@/lib/ai/types";

vi.mock("@/lib/news/newsCache", () => ({
  resolveNewsContext: vi.fn().mockResolvedValue([
    { title: "Next.js 15 Released with Turbopack Default", source: "Hacker News" },
    { title: "Anthropic Claude 3.5 Sonnet Updates", source: "Dev.to" },
  ]),
}));

vi.mock("@/lib/ai/agents/scoutAgent", () => ({
  runScoutAgent: vi.fn().mockResolvedValue({
    topicAngle: "Contrarian AI agent architecture",
    targetAudience: "Staff AI Engineers",
    hookIdeas: [
      "Most AI agents are brittle toys.",
      "Why 90% of agentic workflows fail.",
      "The 3-agent pattern that actually scales.",
    ],
    suggestedStructure: "Hook -> Flaw -> 3 Rules -> CTA",
  }),
}));

vi.mock("@/lib/ai/agents/writerAgent", () => ({
  runWriterAgent: vi
    .fn()
    .mockResolvedValue(
      "Most AI pipelines fail because they try to do everything in one single prompt.\n\nHere are 3 rules that fix it:\n1. Separate Scout from Writer\n2. Score every line\n3. Keep your keys local.\n\nWhat's your biggest agent hurdle?"
    ),
}));

vi.mock("@/lib/ai/agents/criticAgent", () => ({
  runCriticAgent: vi.fn().mockResolvedValue({
    finalScore: 92,
    improvedPost:
      "Most AI pipelines fail because they try to do everything in one single prompt.\n\nHere are 3 rules that fix it:\n1. Separate Scout from Writer\n2. Score every line live\n3. Keep your keys local.\n\nWhat is your biggest agent hurdle today?",
    critiqueNotes: ["Sharpened CTA and rhythm."],
  }),
}));

describe("LUNVO 2.0 Workflow Automation Engine", () => {
  const mockProfile: AIProfile = {
    id: "test-profile",
    label: "Test Profile",
    provider: "openai",
    model: "gpt-4o",
    apiKey: "test-key",
  };

  it("should have all 12 production prebuilt templates with valid nodes and edges", () => {
    expect(PREBUILT_WORKFLOWS.length).toBe(12);
    PREBUILT_WORKFLOWS.forEach((workflow) => {
      expect(workflow.metadata.id).toBeDefined();
      expect(workflow.metadata.name).toBeDefined();
      expect(workflow.nodes.length).toBeGreaterThan(0);
      expect(workflow.edges.length).toBeGreaterThan(0);
    });
  });

  it("should execute the Classic 3-Agent Storyteller pipeline end-to-end", async () => {
    const classicWorkflow = PREBUILT_WORKFLOWS.find(
      (w) => w.metadata.id === "classic-3agent-storyteller"
    )!;
    expect(classicWorkflow).toBeDefined();

    const stepsTracked: string[] = [];
    const context = await executeWorkflow({
      workflow: classicWorkflow,
      profile: mockProfile,
      topic: "AI Agent Architecture",
      onStepUpdate: (nodeId, status) => {
        if (status === "success") stepsTracked.push(nodeId);
      },
    });

    expect(context.workflowId).toBe("classic-3agent-storyteller");
    expect(context.scoutResult?.topicAngle).toBe("Contrarian AI agent architecture");
    expect(context.currentDraft).toContain("Most AI pipelines fail");
    expect(context.criticResult?.finalScore).toBe(92);
    expect(stepsTracked.length).toBe(classicWorkflow.nodes.length);
  });

  it("should format carousel slides in the Bullet Notes to Carousel template", async () => {
    const carouselWorkflow = PREBUILT_WORKFLOWS.find(
      (w) => w.metadata.id === "bullet-notes-to-carousel"
    )!;
    expect(carouselWorkflow).toBeDefined();

    const context = await executeWorkflow({
      workflow: carouselWorkflow,
      profile: mockProfile,
      content:
        "Rule 1: Build local.\n\nRule 2: Never give away API keys.\n\nRule 3: Keep 100% Zero-ban.",
    });

    expect(context.carouselSlides).toBeDefined();
    expect(context.carouselSlides?.length).toBe(5);
    expect(context.humanScore).toBeGreaterThanOrEqual(0);
  });

  it("should correctly handle JSON export and import", () => {
    const original = PREBUILT_WORKFLOWS[0];
    expect(original).toBeDefined();
    const exportedJson = exportWorkflowToJson(original!);
    expect(typeof exportedJson).toBe("string");

    const imported = importWorkflowFromJson(exportedJson);
    expect(imported.metadata.id).toContain("imported-");
    expect(imported.metadata.name).toBe(original!.metadata.name);
    expect(imported.nodes.length).toBe(original!.nodes.length);
    expect(imported.edges.length).toBe(original!.edges.length);
  });
});
