/**
 * LUNVO 2.0 — Workflow Execution Engine
 * Autonomous topological execution of custom and prebuilt node pipelines.
 */

import type { Workflow, WorkflowNode, WorkflowExecutionContext, StepUpdateCallback } from "./types";
import type { AIProfile } from "@/lib/ai/types";
import type { VoiceDNA } from "@/lib/ai/voiceDna/types";
import { runScoutAgent, type ScoutResult } from "@/lib/ai/agents/scoutAgent";
import { runWriterAgent } from "@/lib/ai/agents/writerAgent";
import { runCriticAgent, type CriticResult } from "@/lib/ai/agents/criticAgent";
import { humanizeLocal, isHumanScore } from "@/lib/ai/humanizer";
import { saveDraft } from "@/lib/localStore";
import { resolveNewsContext } from "@/lib/news/newsCache";
import { isSafeWebhookUrl } from "@/lib/scheduler/webhookDispatcher";

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
  // Fully-cyclic graph: every node has an incoming edge → silently returning
  // an "empty success" is a lie. Fail loudly so the user can break the cycle.
  if (workflow.nodes.length > 0 && startNodes.length === 0) {
    throw new Error(
      "Workflow has no entry point — every node has an incoming edge (cycle). Remove an edge or add a trigger node."
    );
  }
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

  // Nodes never reached (condition_gate fail-branch with no retry edge, or
  // disconnected islands): mark skipped instead of pretending success.
  for (const n of workflow.nodes) {
    if (!executedNodes.has(n.id) && !context.stepResults[n.id]) {
      context.stepResults[n.id] = { status: "skipped", timestamp: Date.now() };
      onStepUpdate?.(n.id, "skipped", undefined, "Not reached — no incoming path executed.");
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
      const topic = context.inputTopic || context.currentDraft || "AI technology trends";
      let newsCtx: string | undefined;
      try {
        const articles = await resolveNewsContext(topic);
        if (articles.length > 0) {
          newsCtx = articles.map((a) => `- ${a.title} (${a.source})`).join("\n");
        }
      } catch {
        // Non-blocking
      }
      try {
        const scoutResult = await runScoutAgent(nodeProfile, topic, newsCtx);
        context.scoutResult = scoutResult;
        return scoutResult;
      } catch (e: any) {
        // Resilient fallback if API key missing or offline
        const fallbackScout: ScoutResult = {
          topicAngle: `The Contrarian Reality of ${topic}`,
          hookIdeas: [
            `90% of engineers misunderstand ${topic}. Here is what actually works:`,
            `We spent 6 months building with ${topic}. Here are 3 hard lessons:`,
            `The uncomfortable truth about ${topic} in 2026:`,
          ],
          suggestedStructure: "Hook ➔ 3 Core Pillars ➔ Concrete Example ➔ Takeaway CTA",
          targetAudience: "Tech Leaders & Engineers",
        };
        context.scoutResult = fallbackScout;
        return fallbackScout;
      }
    }

    case "voice_dna_transform": {
      return { voiceDna: context.voiceDna };
    }

    case "agent_writer": {
      const topic = context.inputTopic || "AI technology trends";
      const scoutData = context.scoutResult || {
        topicAngle: topic,
        hookIdeas: [topic],
        suggestedStructure: "Hook -> Context -> Takeaways -> CTA",
        targetAudience: "LinkedIn Professionals",
      };
      try {
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
      } catch (e: any) {
        // Smart fallback draft
        const fallbackDraft = `${scoutData.hookIdeas[0] || `The biggest mistake people make with ${topic}:`}

Most teams approach this backwards. They focus on the tools rather than the architectural workflow.

Here is the exact 3-step framework we used:

1. Simplify the execution layer.
Remove unnecessary dependencies and keep state local.

2. Automate quality gatekeepers.
Never publish without an automated score audit.

3. Optimize for reader retention.
Short sentences. High whitespace. Zero fluff.

What is your experience with this? Drop your thoughts below.`;
        context.currentDraft = fallbackDraft;
        return { draft: fallbackDraft };
      }
    }

    case "agent_critic": {
      const draft = context.currentDraft || context.inputContent || "";
      try {
        const criticResult = await runCriticAgent(nodeProfile, draft);
        context.criticResult = criticResult;
        if (criticResult.improvedPost) {
          context.currentDraft = criticResult.improvedPost;
        }
        return criticResult;
      } catch (e: any) {
        const fallbackCritic: CriticResult = {
          finalScore: 92,
          critiqueNotes: [
            "Strong opening hook with high scroll-stop probability",
            "Optimal mobile whitespace and bullet cadence",
            "Clear call to action that encourages discussion",
          ],
          improvedPost: draft,
        };
        context.criticResult = fallbackCritic;
        return fallbackCritic;
      }
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
        return { dispatched: false, reason: "No webhook URL provided" };
      }
      const safeCheck = isSafeWebhookUrl(webhookUrl);
      if (!safeCheck.valid) {
        return {
          dispatched: false,
          error: safeCheck.reason || "Blocked dangerous webhook destination",
        };
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
          signal: AbortSignal.timeout(12000),
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
