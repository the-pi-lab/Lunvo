/**
 * LUNVO 2.0 — Workflow Execution Engine
 * Autonomous topological execution of custom and prebuilt node pipelines.
 */

import type { Workflow, WorkflowNode, WorkflowExecutionContext, StepUpdateCallback } from "./types";
import type { AIProfile } from "@/lib/ai/types";
import type { VoiceDNA } from "@/lib/ai/voiceDna/types";
import { runScoutAgent } from "@/lib/ai/agents/scoutAgent";
import { runWriterAgent } from "@/lib/ai/agents/writerAgent";
import { runCriticAgent } from "@/lib/ai/agents/criticAgent";
import { humanizeLocal, isHumanScore } from "@/lib/ai/humanizer";
import { saveDraft } from "@/lib/localStore";
import { resolveNewsContext } from "@/lib/news/newsCache";

export interface RunWorkflowOptions {
  workflow: Workflow;
  profile: AIProfile;
  topic?: string;
  content?: string;
  voiceDna?: VoiceDNA | null;
  onStepUpdate?: StepUpdateCallback;
}

/**
 * Executes a full n8n-style workflow graph.
 */
export async function executeWorkflow(
  options: RunWorkflowOptions
): Promise<WorkflowExecutionContext> {
  const { workflow, profile, topic = "", content = "", voiceDna = null, onStepUpdate } = options;

  const context: WorkflowExecutionContext = {
    workflowId: workflow.metadata.id,
    profile,
    voiceDna,
    inputTopic: topic,
    inputContent: content,
    currentDraft: content || topic,
    retryCount: {},
    stepResults: {},
  };

  const nodeMap = new Map<string, WorkflowNode>();
  workflow.nodes.forEach((n) => nodeMap.set(n.id, n));

  // Find start nodes (triggers or nodes without incoming edges)
  const incomingEdges = new Map<string, string[]>();
  const outgoingEdges = new Map<string, Array<{ target: string; label?: string }>>();

  workflow.edges.forEach((e) => {
    if (!incomingEdges.has(e.target)) incomingEdges.set(e.target, []);
    incomingEdges.get(e.target)!.push(e.source);

    if (!outgoingEdges.has(e.source)) outgoingEdges.set(e.source, []);
    outgoingEdges.get(e.source)!.push({ target: e.target, label: e.label });
  });

  const startNodes = workflow.nodes.filter(
    (n) => !incomingEdges.has(n.id) || incomingEdges.get(n.id)!.length === 0
  );
  const queue: string[] = startNodes.map((n) => n.id);
  const executedNodes = new Set<string>();

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    onStepUpdate?.(nodeId, "running", undefined, `Executing ${node.data.label || node.type}...`);
    context.stepResults[nodeId] = { status: "running", timestamp: Date.now() };

    try {
      // Execute the specific node type
      const output = await executeSingleNode(node, context, onStepUpdate);
      context.stepResults[nodeId] = { status: "success", output, timestamp: Date.now() };
      executedNodes.add(nodeId);
      onStepUpdate?.(
        nodeId,
        "success",
        output,
        `${node.data.label || node.type} completed successfully.`
      );

      // Branching logic for Condition Gates
      if (node.type === "condition_gate") {
        const passed = output?.passed === true;
        const nextEdges = outgoingEdges.get(nodeId) || [];
        for (const edge of nextEdges) {
          const isPassBranch =
            edge.label?.toLowerCase().includes("pass") || edge.label?.includes(">=");
          const isRetryBranch =
            edge.label?.toLowerCase().includes("retry") || edge.label?.includes("<");

          if (passed && (isPassBranch || !edge.label)) {
            if (!queue.includes(edge.target)) queue.push(edge.target);
          } else if (!passed && isRetryBranch) {
            const retries = context.retryCount[nodeId] || 0;
            const maxRetries = (node.data as any).maxRetries || 2;
            if (retries < maxRetries) {
              context.retryCount[nodeId] = retries + 1;
              if (!queue.includes(edge.target)) queue.push(edge.target);
            }
          }
        }
      } else {
        // Standard forward progression
        const nextEdges = outgoingEdges.get(nodeId) || [];
        for (const edge of nextEdges) {
          if (!executedNodes.has(edge.target) && !queue.includes(edge.target)) {
            queue.push(edge.target);
          }
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      context.stepResults[nodeId] = { status: "failed", error: errorMsg, timestamp: Date.now() };
      onStepUpdate?.(nodeId, "failed", undefined, `Error: ${errorMsg}`);
      throw new Error(`Workflow node '${node.data.label || nodeId}' failed: ${errorMsg}`);
    }
  }

  return context;
}

/**
 * Individual Node Execution Logic
 */
async function executeSingleNode(
  node: WorkflowNode,
  context: WorkflowExecutionContext,
  onStepUpdate?: StepUpdateCallback
): Promise<any> {
  // Model profile override if node has custom provider/model
  const nodeProfile: AIProfile = {
    ...context.profile,
    provider: node.data.providerOverride || context.profile.provider,
    model: node.data.modelOverride || context.profile.model,
  };

  switch (node.type) {
    case "trigger_manual":
    case "trigger_youtube":
    case "trigger_telegram":
    case "trigger_schedule": {
      return { topic: context.inputTopic, content: context.inputContent };
    }

    case "trigger_rss": {
      const query = (node.data as any).query || context.inputTopic || "AI tech";
      const limit = (node.data as any).limit || 3;
      let newsContext = "";
      try {
        const articles = await resolveNewsContext(query);
        if (articles.length > 0) {
          newsContext = articles
            .slice(0, limit)
            .map((a) => `- ${a.title} (${a.source})`)
            .join("\n");
        }
      } catch {
        // Fallback gracefully
      }
      context.inputTopic = context.inputTopic || query;
      return { newsContext };
    }

    case "agent_scout": {
      const topic = context.inputTopic || context.currentDraft || "AI tech trends";
      let newsCtx: string | undefined;
      try {
        const articles = await resolveNewsContext(topic);
        if (articles.length > 0) {
          newsCtx = articles.map((a) => `- ${a.title} (${a.source})`).join("\n");
        }
      } catch {
        // Non-blocking
      }
      const scoutResult = await runScoutAgent(nodeProfile, topic, newsCtx);
      context.scoutResult = scoutResult;
      return scoutResult;
    }

    case "voice_dna_transform": {
      return { voiceDna: context.voiceDna };
    }

    case "agent_writer": {
      const topic = context.inputTopic || "AI tech trends";
      const scoutData = context.scoutResult || {
        topicAngle: topic,
        hookIdeas: [topic],
        suggestedStructure: "Hook -> Context -> Takeaways -> CTA",
        targetAudience: "LinkedIn Professionals",
      };
      const draft = await runWriterAgent(
        nodeProfile,
        topic,
        scoutData,
        context.voiceDna || null,
        (chunk, full) => {
          context.currentDraft = full;
        }
      );
      context.currentDraft = draft;
      return { draft };
    }

    case "agent_critic": {
      const draft = context.currentDraft || context.inputContent || "";
      const criticResult = await runCriticAgent(nodeProfile, draft);
      context.criticResult = criticResult;
      if (criticResult.improvedPost) {
        context.currentDraft = criticResult.improvedPost;
      }
      return criticResult;
    }

    case "humanizer_filter": {
      const raw = context.currentDraft || context.inputContent || "";
      const cleaned = humanizeLocal(raw);
      const score = isHumanScore(cleaned);
      context.currentDraft = cleaned;
      context.humanScore = score;
      return { cleanedDraft: cleaned, humanScore: score };
    }

    case "carousel_formatter": {
      const raw = context.currentDraft || context.inputContent || "";
      const slides = [
        { slideNumber: 1, title: "The Hook", body: raw.split("\n\n")[0] || raw.slice(0, 100) },
        {
          slideNumber: 2,
          title: "The Core Problem",
          body: "Why traditional approaches fail and cost you time.",
        },
        { slideNumber: 3, title: "The Shift", body: "The exact blueprint we used to solve it." },
        {
          slideNumber: 4,
          title: "Key Takeaways",
          body: raw.split("\n\n")[1] || "3 key rules to implement today.",
        },
        {
          slideNumber: 5,
          title: "What's Next?",
          body: "Save this post and share your thoughts in the comments.",
        },
      ];
      context.carouselSlides = slides;
      return { slides };
    }

    case "repurpose_transformer": {
      const format = (node.data as any).format || "linkedin_variants";
      const raw = context.currentDraft || context.inputContent || "";
      return { format, text: raw };
    }

    case "condition_gate": {
      const field = (node.data as any).field || "critic_score";
      const threshold = (node.data as any).threshold || 80;
      let val = 0;
      if (field === "critic_score") {
        val = context.criticResult?.finalScore || 85;
      } else if (field === "human_score") {
        val = context.humanScore || 90;
      } else if (field === "character_count") {
        val = (context.currentDraft || "").length;
      }
      const passed = val >= threshold;
      return { passed, actualValue: val, threshold };
    }

    case "output_draft_store": {
      const textToSave = context.currentDraft || context.inputContent || "";
      if (textToSave && typeof window !== "undefined") {
        saveDraft(textToSave, "created", "Automated Workflow Draft");
      }
      return { saved: true, length: textToSave.length };
    }

    case "output_webhook": {
      const webhookUrl = (node.data as any).url;
      if (!webhookUrl || typeof fetch === "undefined") {
        return { dispatched: false, reason: "No webhook URL" };
      }
      const payload = {
        event: "lunvo.post.publish",
        timestamp: new Date().toISOString(),
        workflowId: context.workflowId,
        post: {
          content: context.currentDraft,
          criticScore: context.criticResult?.finalScore,
          humanScore: context.humanScore,
        },
      };
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return { dispatched: res.ok, status: res.status };
      } catch (e: any) {
        return { dispatched: false, error: e?.message };
      }
    }

    default:
      return { executed: true };
  }
}
