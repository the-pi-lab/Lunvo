#!/usr/bin/env node
/**
 * LUNVO 2.0 — Headless Model Context Protocol (MCP) Server
 * Full headless IDE control for Claude Desktop, Cursor, Antigravity, and VS Code.
 *
 * Tools:
 * 1. search_trending — Multi-source tech & AI news
 * 2. analyze_draft — Local 0-cost heuristics + Human score
 * 3. generate_pipeline_post — 3-Agent Neural Pipeline (Scout -> Writer -> Critic)
 * 4. humanize_post — Anti-AI slop cleaner + burstiness booster
 * 5. train_voice_dna — Ingest sample posts to extract Voice DNA profile
 * 6. repurpose_content — Convert to Twitter thread, Newsletter, or Video script
 * 7. execute_workflow — Run any of the 12 prebuilt or custom n8n workflows
 * 8. schedule_post — Local queue & outbound webhook dispatcher
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { analyzeLocally } from "../lib/analysis/localHeuristics.ts";
import { humanizeLocal, isHumanScore } from "../lib/ai/humanizer.ts";
import { PREBUILT_WORKFLOWS } from "../lib/workflow/templates/index.ts";

const server = new Server(
  {
    name: "lunvo-mcp",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper to resolve active AI profile (registry-validated, Studio parity)
async function getProfileFromEnv() {
  const rawProvider = process.env.AI_PROVIDER || (process.env.GROQ_API_KEY ? "groq" : "gemini");
  const apiKey =
    process.env.AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    "";
  let provider = rawProvider;
  let model = process.env.AI_MODEL || "";
  try {
    const { getProviderDef } = await import("../lib/ai/providers/registry.ts");
    const def = getProviderDef(rawProvider);
    if (!def) provider = "gemini";
    if (!model) model = getProviderDef(provider)?.defaultModel || "gemini-2.0-flash";
  } catch {
    if (!model) model = provider === "groq" ? "llama-3.3-70b-versatile" : "gemini-2.0-flash";
  }

  return {
    id: "mcp-env-profile",
    label: "MCP Default Profile",
    provider: provider as any,
    apiKey,
    model,
    baseURL: process.env.AI_BASE_URL,
  };
}

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_trending",
        description:
          "Search trending LinkedIn-relevant articles across RSS, Hacker News, Dev.to, GitHub, and Currents. Read-only, no API key required for RSS/HN/GitHub.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search keyword, e.g. 'AI', 'Next.js', 'fundraising'",
            },
            limit: {
              type: "number",
              description: "Max results (1-10, default 5)",
              minimum: 1,
              maximum: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "analyze_draft",
        description:
          "Analyze a LinkedIn draft locally (0 API cost) — returns Hook, Readability, Engagement, Structure scores 0-10, Overall Virality score (0-100), and Anti-AI Human Score.",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "Draft text to analyze (min 20 chars)" },
          },
          required: ["content"],
        },
      },
      {
        name: "generate_pipeline_post",
        description:
          "Execute LUNVO's 3-Agent Neural Pipeline (Scout -> Writer -> Critic) headlessly. Returns the polished draft, virality score, and critique notes.",
        inputSchema: {
          type: "object",
          properties: {
            topic: { type: "string", description: "Topic, raw idea, or headline" },
            targetAudience: {
              type: "string",
              description: "Optional target audience (e.g. 'SaaS Founders', 'AI Engineers')",
            },
            provider: {
              type: "string",
              description:
                "Optional AI provider override (e.g. 'groq', 'gemini', 'openai', 'anthropic', 'ollama')",
            },
            model: { type: "string", description: "Optional AI model override" },
          },
          required: ["topic"],
        },
      },
      {
        name: "humanize_post",
        description:
          "Strips out AI clichés ('delve', 'tapestry', 'synergy') and enhances sentence length burstiness toward 85%+ human score (local heuristic).",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "AI-generated text to humanize" },
          },
          required: ["content"],
        },
      },
      {
        name: "train_voice_dna",
        description:
          "Ingests raw writing samples and extracts a parametric Voice DNA profile (formality, emoji, technical depth, punchiness, and custom tone rules).",
        inputSchema: {
          type: "object",
          properties: {
            samplePosts: {
              type: "array",
              items: { type: "string" },
              description: "Array of your past high-performing posts (1-5 posts)",
            },
          },
          required: ["samplePosts"],
        },
      },
      {
        name: "repurpose_content",
        description:
          "Repurposes any raw notes, article, or video transcript into LinkedIn post, Twitter thread, or Newsletter format.",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "Raw content to repurpose" },
            targetFormat: {
              type: "string",
              enum: ["linkedin_variants", "twitter_thread", "newsletter_blog", "video_script"],
              description: "Target output format",
            },
          },
          required: ["content", "targetFormat"],
        },
      },
      {
        name: "execute_workflow",
        description:
          "Runs any of LUNVO's 12 prebuilt n8n-style automation workflows (e.g. 'rss-tech-trends', 'youtube-repurposer', 'quality-gatekeeper', 'multi-platform-matrix').",
        inputSchema: {
          type: "object",
          properties: {
            workflowId: {
              type: "string",
              description:
                "Workflow template ID, e.g. 'rss-tech-trends', 'quality-gatekeeper', 'bullet-notes-to-carousel'",
            },
            inputTopic: { type: "string", description: "Input topic or raw text for the workflow" },
          },
          required: ["workflowId"],
        },
      },
      {
        name: "schedule_post",
        description:
          "Schedules a LinkedIn post locally and dispatches payload to Zapier / Make / Buffer webhook upon publish time.",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "Post content to schedule" },
            scheduledTime: {
              type: "string",
              description: "ISO date-time string (e.g. '2026-09-01T09:00:00Z')",
            },
            webhookUrl: {
              type: "string",
              description: "Optional webhook URL (Zapier, Make, Buffer)",
            },
          },
          required: ["content", "scheduledTime"],
        },
      },
    ],
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_trending") {
      const query = (args?.query as string) || "";
      const limit = Math.min(10, Math.max(1, Number(args?.limit) || 5));
      if (!query || query.trim().length < 2) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Query must be at least 2 characters" }),
            },
          ],
          isError: true,
        };
      }
      const { searchTrendingArticles } = await import("../lib/rss/searchService.ts");
      const result = await searchTrendingArticles(query, limit);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                query: result.query,
                totalFound: result.totalFound,
                sources: result.sources,
                articles: result.articles.map((a) => ({
                  title: a.title,
                  source: a.source,
                  link: a.link,
                  date: a.date,
                  description: a.description?.slice(0, 200),
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "analyze_draft") {
      const content = (args?.content as string) || "";
      if (!content || content.trim().length < 20) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Content must be at least 20 characters" }),
            },
          ],
          isError: true,
        };
      }
      const local = analyzeLocally(content);
      const humanScore = isHumanScore(content);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                scores: local.scores,
                overall_score: local.overall_score,
                isHumanScore: humanScore,
                top_problems: [
                  local.scores.hook.explanation,
                  local.scores.readability.explanation,
                  local.scores.engagement.explanation,
                ].slice(0, 3),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "generate_pipeline_post") {
      const topic = (args?.topic as string) || "";
      const profile = await getProfileFromEnv();
      if (args?.provider) profile.provider = args.provider as any;
      if (args?.model) profile.model = args.model as string;

      const { runContentPipeline } = await import("../lib/ai/agents/orchestrator.ts");
      const result = await runContentPipeline(profile, topic, null);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                topic,
                finalPost: result.improvedPost,
                finalScore: result.finalScore,
                critiqueNotes: result.critiqueNotes,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "humanize_post") {
      const content = (args?.content as string) || "";
      const cleaned = humanizeLocal(content);
      const score = isHumanScore(cleaned);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                originalLength: content.length,
                humanizedPost: cleaned,
                humanScore: score,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "train_voice_dna") {
      const samples = (args?.samplePosts as string[]) || [];
      const { normalizePostText } = await import("../lib/ai/voiceDna/ingestor.ts");
      const normalized = samples.map(normalizePostText).filter(Boolean);

      // Analyze actual linguistic characteristics from input samples
      const allText = normalized.join(" ");
      const emojiMatches =
        allText.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu) || [];
      const emojiDensity = Math.min(
        100,
        Math.round((emojiMatches.length / Math.max(1, allText.length)) * 1000)
      );
      const exclamationCount = (allText.match(/!/g) || []).length;
      const punchiness = Math.min(100, Math.max(30, 60 + exclamationCount * 5));
      const technicalKeywords = (
        allText.match(
          /\b(api|architecture|framework|database|cloud|ai|model|latency|docker|git)\b/gi
        ) || []
      ).length;
      const technicalDepth = Math.min(100, Math.max(20, technicalKeywords * 10));

      const dna = {
        formality: technicalDepth > 60 ? 70 : 45,
        emojiDensity,
        technicalDepth,
        punchiness,
        customRules: [
          "Use short, punchy paragraphs",
          "Open with a strong contrarian or data-backed hook",
          "Conclude with a clear engagement prompt",
        ],
        sampleCount: normalized.length,
      };

      try {
        const { saveTrainedDna } = await import("../lib/voice-dna/memory.ts");
        saveTrainedDna({
          id: `dna-mcp-${Date.now()}`,
          userId: "local-commander",
          dna: {
            tone: ["authentic", technicalDepth > 50 ? "technical" : "conversational"],
            styleRules: dna.customRules,
            targetAudience: "Engineering & Tech Founders",
            emojiUsage: emojiDensity > 20 ? "moderate" : "minimal",
            formattingPreferences: {
              useBulletPoints: true,
              useOneSentenceParagraphs: true,
              useLineBreaksBetweenParagraphs: true,
            },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // node/cli environment fallback
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(dna, null, 2),
          },
        ],
      };
    }

    if (name === "repurpose_content") {
      const content = (args?.content as string) || "";
      const targetFormat = (args?.targetFormat as string) || "twitter_thread";
      const profile = await getProfileFromEnv();

      if (targetFormat === "twitter_thread") {
        const { repurposeToTwitter } = await import("../lib/ai/repurpose/twitterThread.ts");
        const thread = await repurposeToTwitter(profile, content);
        return {
          content: [
            { type: "text", text: JSON.stringify({ format: targetFormat, thread }, null, 2) },
          ],
        };
      } else if (targetFormat === "newsletter_blog") {
        const { repurposeToNewsletter } = await import("../lib/ai/repurpose/newsletterBlog.ts");
        const article = await repurposeToNewsletter(profile, content);
        return {
          content: [
            { type: "text", text: JSON.stringify({ format: targetFormat, article }, null, 2) },
          ],
        };
      } else if (targetFormat === "video_script") {
        const { repurposeToVideoScript } = await import("../lib/ai/repurpose/videoScript.ts");
        const script = await repurposeToVideoScript(profile, content);
        return {
          content: [
            { type: "text", text: JSON.stringify({ format: targetFormat, script }, null, 2) },
          ],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify({ error: "Unsupported format" }) }],
        isError: true,
      };
    }

    if (name === "execute_workflow") {
      const workflowId = (args?.workflowId as string) || "classic-3agent-storyteller";
      const inputTopic = (args?.inputTopic as string) || "AI technology trends";
      const workflow =
        PREBUILT_WORKFLOWS.find((w) => w.metadata.id === workflowId) || PREBUILT_WORKFLOWS[0];
      const profile = await getProfileFromEnv();

      const { executeWorkflow } = await import("../lib/workflow/workflowRunner.ts");
      const result = await executeWorkflow({
        workflow: workflow!,
        profile,
        topic: inputTopic,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                workflowId: result.workflowId,
                finalDraft: result.currentDraft,
                criticScore: result.criticResult?.finalScore,
                humanScore: result.humanScore,
                stepResults: result.stepResults,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "schedule_post") {
      // Honest local-only semantics: queueStore is localStorage-backed (browser).
      // Under node/stdio there is no window/localStorage — do not claim queued.
      const content = (args?.content as string) || "";
      const scheduledTime = (args?.scheduledTime as string) || new Date().toISOString();
      const webhookUrl = (args?.webhookUrl as string) || "";
      const isBrowser = typeof window !== "undefined";

      if (!isBrowser) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  scheduled: false,
                  queued: false,
                  reason:
                    "Local-only queue: schedule_post needs browser localStorage. Copy content into Dashboard → Distribution to queue, or pass webhookUrl for direct dispatch.",
                  content,
                  scheduledTime,
                  targetWebhook: webhookUrl || null,
                  characterCount: content.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const { saveScheduledPost } = await import("../lib/scheduler/queueStore");
      const post = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? `mcp-${crypto.randomUUID()}`
            : `mcp-${Date.now()}`,
        title: content.slice(0, 40) || "MCP Scheduled Post",
        content,
        scheduledTime,
        status: "queued" as const,
        targetWebhookUrl: webhookUrl || undefined,
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date().toISOString(),
        source: "workflow" as const,
      };
      saveScheduledPost(post);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                scheduled: true,
                postId: post.id,
                scheduledTime,
                targetWebhook: webhookUrl || "Default Local Queue",
                characterCount: content.length,
                status: "queued",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `MCP execution error: ${error?.message || String(error)}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("MCP server failed:", error);
  process.exit(1);
});
