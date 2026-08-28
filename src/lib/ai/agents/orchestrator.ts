import { AIProfile } from "../types";
import { VoiceDNA } from "../voiceDna/types";
import { runScoutAgent, ScoutResult } from "./scoutAgent";
import { runWriterAgent } from "./writerAgent";
import { runCriticAgent, CriticResult } from "./criticAgent";
import { resolveNewsContext } from "@/lib/news/newsCache";

export interface PipelineProgress {
  stage: "idle" | "scouting" | "writing" | "critiquing" | "complete" | "error";
  message: string;
  scoutResult?: ScoutResult;
  draft?: string;
  streamingDraft?: string;
  criticResult?: CriticResult;
}

/**
 * Orchestrates the full 3-agent pipeline.
 * Accepts a callback to stream progress updates to the UI.
 */
export async function runContentPipeline(
  profile: AIProfile,
  rawTopic: string,
  voiceDna: VoiceDNA | null,
  onProgress?: (progress: PipelineProgress) => void
): Promise<CriticResult> {
  try {
    // Phase 22: resolve news context with 6hr cache + 5s timeout (non-blocking)
    let newsContext: string | undefined;
    try {
      const articles = await resolveNewsContext(rawTopic);
      if (articles.length > 0) {
        newsContext = articles.map((a) => `- ${a.title} (${a.source})`).join("\n");
      }
    } catch {
      // ignore news errors — scout still runs
    }

    // 1. Scout Agent
    onProgress?.({
      stage: "scouting",
      message: "Scout Agent is analyzing trends and generating hooks...",
    });
    const scoutResult = await runScoutAgent(profile, rawTopic, newsContext);

    // 2. Writer Agent — Phase 23: streaming word-by-word
    onProgress?.({
      stage: "writing",
      message: "Writer Agent is drafting the post using your Voice DNA...",
      scoutResult,
      streamingDraft: "",
    });
    const draft = await runWriterAgent(profile, rawTopic, scoutResult, voiceDna, (chunk, full) => {
      onProgress?.({
        stage: "writing",
        message: "Writer Agent is drafting...",
        scoutResult,
        streamingDraft: full,
        draft: full,
      });
    });

    // 3. Critic Agent
    onProgress?.({
      stage: "critiquing",
      message: "Critic Agent is auditing for readability, fluff, and algorithm hooks...",
      scoutResult,
      draft,
    });
    const criticResult = await runCriticAgent(profile, draft);

    // Complete
    onProgress?.({
      stage: "complete",
      message: "Pipeline complete!",
      scoutResult,
      draft,
      criticResult,
    });

    return criticResult;
  } catch (error: any) {
    onProgress?.({
      stage: "error",
      message: `Pipeline Error: ${error.message}`,
    });
    throw error;
  }
}
