import { AIProfile } from "../types";
import { VoiceDNA } from "../voiceDna/types";
import { runScoutAgent, ScoutResult } from "./scoutAgent";
import { runWriterAgent } from "./writerAgent";
import { runCriticAgent, CriticResult } from "./criticAgent";

export interface PipelineProgress {
  stage: 'idle' | 'scouting' | 'writing' | 'critiquing' | 'complete' | 'error';
  message: string;
  scoutResult?: ScoutResult;
  draft?: string;
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
    // 1. Scout Agent
    onProgress?.({ stage: 'scouting', message: 'Scout Agent is analyzing trends and generating hooks...' });
    const scoutResult = await runScoutAgent(profile, rawTopic);

    // 2. Writer Agent
    onProgress?.({ 
      stage: 'writing', 
      message: 'Writer Agent is drafting the post using your Voice DNA...',
      scoutResult 
    });
    const draft = await runWriterAgent(profile, rawTopic, scoutResult, voiceDna);

    // 3. Critic Agent
    onProgress?.({ 
      stage: 'critiquing', 
      message: 'Critic Agent is auditing for readability, fluff, and algorithm hooks...',
      scoutResult,
      draft 
    });
    const criticResult = await runCriticAgent(profile, draft);

    // Complete
    onProgress?.({ 
      stage: 'complete', 
      message: 'Pipeline complete!',
      scoutResult,
      draft,
      criticResult
    });

    return criticResult;
  } catch (error: any) {
    onProgress?.({ 
      stage: 'error', 
      message: `Pipeline Error: ${error.message}` 
    });
    throw error;
  }
}
