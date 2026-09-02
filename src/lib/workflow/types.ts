/**
 * LUNVO 2.0 — Workflow Automation Schema & Types
 * Powering the n8n-style visual node engine & autonomous pipeline execution.
 */

import type { AIProfile } from "@/lib/ai/types";
import type { VoiceDNA } from "@/lib/ai/voiceDna/types";
import type { ScoutResult } from "@/lib/ai/agents/scoutAgent";
import type { CriticResult } from "@/lib/ai/agents/criticAgent";

export type NodeType =
  | "trigger_manual"
  | "trigger_rss"
  | "trigger_schedule"
  | "trigger_telegram"
  | "trigger_youtube"
  | "agent_scout"
  | "agent_writer"
  | "agent_critic"
  | "voice_dna_transform"
  | "humanizer_filter"
  | "carousel_formatter"
  | "repurpose_transformer"
  | "condition_gate"
  | "output_draft_store"
  | "output_webhook";

export interface NodePosition {
  x: number;
  y: number;
}

export interface BaseNodeData {
  label: string;
  description?: string;
  providerOverride?: string;
  modelOverride?: string;
  temperature?: number;
  customPrompt?: string;
  [key: string]: any;
}

export interface TriggerRssData extends BaseNodeData {
  query?: string;
  limit?: number;
  category?: "tech" | "ai" | "saas" | "general";
}

export interface TriggerScheduleData extends BaseNodeData {
  cronExpression?: string;
  timeOfDay?: string; // e.g. "09:00"
  daysOfWeek?: number[]; // [1, 2, 3, 4, 5]
}

export interface ConditionGateData extends BaseNodeData {
  field: "critic_score" | "human_score" | "character_count";
  operator: "gte" | "lte" | "gt" | "lt" | "eq";
  threshold: number;
  maxRetries?: number;
}

export interface OutputWebhookData extends BaseNodeData {
  url: string;
  targetPlatform?: "zapier" | "make" | "buffer" | "custom";
  secretToken?: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: NodePosition;
  data: BaseNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "creation" | "repurpose" | "scheduling" | "quality" | "multiplatform";
  author?: string;
  version: string;
  isPrebuilt?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExecutionContext {
  workflowId: string;
  profile: AIProfile;
  voiceDna?: VoiceDNA | null;
  inputTopic?: string;
  inputContent?: string;
  currentDraft?: string;
  scoutResult?: ScoutResult;
  criticResult?: CriticResult;
  humanScore?: number;
  carouselSlides?: Array<{ title: string; body: string; slideNumber: number }>;
  retryCount: Record<string, number>;
  stepResults: Record<
    string,
    {
      status: "pending" | "running" | "success" | "skipped" | "failed";
      output?: any;
      error?: string;
      timestamp: number;
    }
  >;
}

export type NodeExecutionStatus = "pending" | "running" | "success" | "skipped" | "failed";

export type StepUpdateCallback = (
  nodeId: string,
  status: "running" | "success" | "skipped" | "failed",
  output?: any,
  message?: string
) => void;
