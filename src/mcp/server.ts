#!/usr/bin/env node
/**
 * Phase 37 — MCP Server (Moat #3)
 * Read-only tools for Claude/Cursor: search_trending, analyze_draft
 * No posting, no Supabase, zero ban — mirrors src/lib/rss/searchService + localHeuristics
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { analyzeLocally } from "../lib/analysis/localHeuristics.ts";

const server = new Server(
  {
    name: "lunvo-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_trending",
        description:
          "Search trending LinkedIn-relevant articles across RSS, Hacker News, Dev.to, GitHub, and Currents. Read-only, no API key required for RSS/HN/GitHub. Returns top articles with title, source, and relevance score.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search keyword, e.g. 'AI', 'React', 'fundraising'",
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
          "Analyze a LinkedIn draft locally (no API call) — returns hook/readability/engagement/structure scores 0-10 + overall + isHumanScore. Read-only, instant, no AI key needed. Mirrors PostEditor inline meter.",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "Draft text to analyze (min 20 chars)" },
          },
          required: ["content"],
        },
      },
    ],
  };
});

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "search_trending") {
    const query = (args?.query as string) || "";
    const limit = Math.min(10, Math.max(1, Number(args?.limit) || 5));

    if (!query || query.trim().length < 2) {
      return {
        content: [
          { type: "text", text: JSON.stringify({ error: "Query must be at least 2 characters" }) },
        ],
        isError: true,
      };
    }

    try {
      // Dynamic import to avoid bundling node: issues for client
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
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { content: [{ type: "text", text: `search_trending failed: ${msg}` }], isError: true };
    }
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

    try {
      const local = analyzeLocally(content);
      // Also compute isHumanScore for the Humanizer moat
      const { isHumanScore } = await import("../lib/ai/humanizer.ts");
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
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { content: [{ type: "text", text: `analyze_draft failed: ${msg}` }], isError: true };
    }
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Keep alive — MCP stdio server
}

main().catch((error) => {
  console.error("MCP server failed:", error);
  process.exit(1);
});
