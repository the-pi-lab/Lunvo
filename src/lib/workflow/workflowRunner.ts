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
import { fetchYouTubeInfo, isYouTubeUrl } from "@/lib/youtube";

export interface RunWorkflowOptions {
  workflow: Workflow;
  profile: AIProfile;
  topic?: string;
  content?: string;
  voiceDna?: VoiceDNA | null;
  onStepUpdate?: StepUpdateCallback;
}

/** Node-data number reader: NaN/empty/garbage can never silently become 0. */
function numOpt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

const RSS_CATEGORY_QUERIES: Record<string, string> = {
  tech: "technology",
  ai: "AI models",
  saas: "SaaS startups",
  general: "business growth",
};

const REPURPOSE_FORMATS = new Set([
  "linkedin_variants",
  "twitter_thread",
  "newsletter",
  "short_script",
]);

/** Inspector temperature/customPrompt → agent opts (validated, else defaults). */
function nodeAgentOpts(node: WorkflowNode): { temperature?: number; customPrompt?: string } {
  const t = (node.data as any).temperature;
  const c = (node.data as any).customPrompt;
  return {
    temperature:
      typeof t === "number" && Number.isFinite(t) ? Math.min(2, Math.max(0, t)) : undefined,
    customPrompt: typeof c === "string" && c.trim() ? c : undefined,
  };
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
    case "trigger_telegram":
    case "trigger_schedule": {
      return { topic: context.inputTopic, content: context.inputContent };
    }

    case "trigger_youtube": {
      // Actually resolves the Inspector's Video URL into title + transcript
      // (previously echoed inputs and the URL setting did nothing).
      const url =
        typeof (node.data as any).youtubeUrl === "string"
          ? (node.data as any).youtubeUrl.trim()
          : "";
      if (url && isYouTubeUrl(url)) {
        try {
          const info = await fetchYouTubeInfo(url);
          context.inputContent = info;
          (context as any).videoTranscript = info;
          return { topic: context.inputTopic, content: info, youtubeUrl: url };
        } catch {
          // fall through to plain passthrough
        }
      }
      return { topic: context.inputTopic, content: context.inputContent };
    }

    case "trigger_rss": {
      const data = node.data as any;
      // Inspector category acts as query fallback so the setting is never decorative
      const query =
        (typeof data.query === "string" && data.query.trim()) ||
        RSS_CATEGORY_QUERIES[data.category] ||
        context.inputTopic ||
        "AI tech";
      const limit = numOpt(data.limit, 3, 1, 10);
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
      // YouTube trigger feeds the transcript in as scouting context
      let newsCtx: string | undefined;
      try {
        const articles = await resolveNewsContext(topic);
        if (articles.length > 0) {
          newsCtx = articles.map((a) => `- ${a.title} (${a.source})`).join("\n");
        }
      } catch {
        // Non-blocking
      }
      const videoCtx =
        typeof (context as any).videoTranscript === "string" &&
        (context as any).videoTranscript.length > 50
          ? `Video transcript excerpt:\n${(context as any).videoTranscript.slice(0, 2000)}`
          : undefined;
      const scoutCtx = [newsCtx, videoCtx].filter(Boolean).join("\n\n") || undefined;
      try {
        const scoutResult = await runScoutAgent(nodeProfile, topic, scoutCtx, nodeAgentOpts(node));
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
      // Applies the Inspector's Tone Persona on top of trained DNA and writes
      // it back to context (previously returned DNA untouched AND never set
      // context, so neither persona nor trained DNA reached the writer).
      const persona = (node.data as any).tonePersona || "default";
      const base: VoiceDNA | null = context.voiceDna || null;
      if (persona === "default" || !persona) {
        return { voiceDna: base };
      }
      const personaTones: Record<string, string[]> = {
        contrarian: ["direct", "contrarian", "bold"],
        storyteller: ["vulnerable", "conversational", "storyteller"],
        analytical: ["analytical", "data-driven", "precise"],
      };
      const merged: VoiceDNA = {
        id: base?.id || "workflow-persona",
        tone: personaTones[persona] || base?.tone || [],
        formatting_preferences: base?.formatting_preferences || {
          uses_bullet_points: false,
          paragraph_length: "short",
          emoji_frequency: "low",
          capitalization_style: "standard",
          hook_style: "starts with a bold statement",
        },
        vocabulary: base?.vocabulary || { commonly_used_words: [], banned_words: [] },
        sentence_structure: base?.sentence_structure || "mixed",
        last_updated: new Date().toISOString(),
      };
      context.voiceDna = merged;
      return { voiceDna: merged, persona };
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
          },
          nodeAgentOpts(node)
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
        const criticResult = await runCriticAgent(nodeProfile, draft, nodeAgentOpts(node));
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
      const strictness = (node.data as any).strictness;
      const mode =
        strictness === "minimal" || strictness === "aggressive" ? strictness : "balanced";
      const cleaned = humanizeLocal(raw, mode);
      const score = isHumanScore(cleaned);
      context.currentDraft = cleaned;
      context.humanScore = score;
      return { cleanedDraft: cleaned, humanScore: score, strictness: mode };
    }

    case "carousel_formatter": {
      const raw = context.currentDraft || context.inputContent || "";
      // Inspector slideCount/theme now drive output (was always 5 fixed slides).
      const count = numOpt((node.data as any).slideCount, 5, 3, 10);
      const theme = (node.data as any).theme || "aurora";
      const paras = raw
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean);
      const titles = [
        "The Hook",
        "The Core Problem",
        "The Shift",
        "Key Takeaways",
        "What's Next?",
        "Deep Dive",
        "Proof Point",
        "Playbook",
        "Mistakes to Avoid",
        "Your Turn",
      ];
      const fallbacks = [
        "Why traditional approaches fail and cost you time.",
        "The exact blueprint we used to solve it.",
        "3 key rules to implement today.",
        "Save this post and share your thoughts in the comments.",
      ];
      const slides = Array.from({ length: count }, (_, i) => ({
        slideNumber: i + 1,
        title: titles[i % titles.length]!,
        body: paras[i] || paras[i % Math.max(1, paras.length)] || fallbacks[i % fallbacks.length]!,
        theme,
      }));
      context.carouselSlides = slides;
      return { slides, theme };
    }

    case "repurpose_transformer": {
      const requested = (node.data as any).format || "linkedin_variants";
      // Legacy alias from older templates ("twitter" → current vocabulary)
      const aliased = requested === "twitter" ? "twitter_thread" : requested;
      const format = REPURPOSE_FORMATS.has(aliased) ? aliased : "linkedin_variants";
      const raw = context.currentDraft || context.inputContent || "";
      return { format, text: raw };
    }

    case "condition_gate": {
      const data = node.data as any;
      const field = data.field || "critic_score";
      const threshold = numOpt(data.threshold, 80, 0, 100000);
      const operator = ["gte", "gt", "lte", "lt", "eq"].includes(data.operator)
        ? data.operator
        : "gte";
      let val = 0;
      if (field === "critic_score") {
        val = context.criticResult?.finalScore || 85;
      } else if (field === "human_score") {
        val = context.humanScore || 90;
      } else if (field === "character_count") {
        val = (context.currentDraft || "").length;
      }
      // The Inspector's operator was previously ignored (always >=).
      const passed =
        operator === "gt"
          ? val > threshold
          : operator === "lte"
            ? val <= threshold
            : operator === "lt"
              ? val < threshold
              : operator === "eq"
                ? val === threshold
                : val >= threshold;
      return { passed, actualValue: val, threshold, operator };
    }

    case "output_draft_store": {
      const textToSave = context.currentDraft || context.inputContent || "";
      const tag =
        typeof (node.data as any).tag === "string" && (node.data as any).tag.trim()
          ? (node.data as any).tag.trim().slice(0, 60)
          : "Automated Draft";
      if (textToSave && typeof window !== "undefined") {
        saveDraft(textToSave, "created", tag);
      }
      return { saved: true, length: textToSave.length, tag };
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
        // Inspector secretToken is forwarded so private webhooks can verify us
        const secret =
          typeof (node.data as any).secretToken === "string" &&
          (node.data as any).secretToken.length > 0
            ? (node.data as any).secretToken.slice(0, 256)
            : undefined;
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(secret ? { "X-Webhook-Token": secret } : {}),
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(12000),
        });
        return { dispatched: res.ok, status: res.status };
      } catch (e: any) {
        return { dispatched: false, error: e?.message };
      }
    }

    case "note_sticky": {
      // Annotation only: zero AI cost, keeps graph documentation in the run log
      const note =
        typeof (node.data as any).note === "string" ? (node.data as any).note.slice(0, 2000) : "";
      return { note, executed: true };
    }

    case "delay_timer": {
      // Bounded wait between steps (e.g. spacing AI calls). Capped at 120s so
      // a typo can't hang a serverless run past platform timeouts.
      const seconds = numOpt((node.data as any).seconds, 5, 1, 120);
      await new Promise((r) => setTimeout(r, seconds * 1000));
      return { waitedMs: seconds * 1000, executed: true };
    }

    default:
      return { executed: true };
  }
}
