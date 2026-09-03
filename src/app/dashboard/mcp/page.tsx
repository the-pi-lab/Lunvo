"use client";

import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Zap,
  Sparkles,
  Search,
  RotateCw,
  Code2,
  Sliders,
  Share2,
  Clock,
  Play,
  Layers,
  ExternalLink,
} from "lucide-react";
import PageHeader from "@/components/premium/PageHeader";
import Reveal from "@/components/motion/Reveal";

const MCP_TOOLS = [
  {
    name: "search_trending",
    description:
      "Searches trending tech & AI topics across Hacker News, Dev.to, GitHub, and RSS feeds.",
    params: "query (string), limit (number: 1-10)",
    icon: Search,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    name: "analyze_draft",
    description:
      "Analyzes a LinkedIn draft locally with 0 API cost — returns 4-pillar scores and Anti-AI score.",
    params: "content (string)",
    icon: Zap,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    name: "generate_pipeline_post",
    description: "Runs the complete 3-Agent Neural Pipeline (Scout ➔ Writer ➔ Critic) headlessly.",
    params: "topic (string), targetAudience? (string), provider? (string)",
    icon: Sparkles,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    name: "humanize_post",
    description:
      "Strips out AI clichés ('delve', 'tapestry', 'synergy') and enhances sentence burstiness.",
    params: "content (string)",
    icon: RotateCw,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    name: "train_voice_dna",
    description:
      "Ingests sample writing to extract a calibrated Voice DNA profile with 4 tone sliders.",
    params: "samplePosts (array of strings)",
    icon: Sliders,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    name: "repurpose_content",
    description: "Converts content into Twitter thread, Newsletter, or 60s Video script format.",
    params:
      "content (string), targetFormat ('twitter_thread' | 'newsletter_blog' | 'video_script')",
    icon: Code2,
    color: "text-pink-600 bg-pink-50 border-pink-200",
  },
  {
    name: "execute_workflow",
    description: "Executes any of the 12 prebuilt or custom n8n automation pipelines headlessly.",
    params: "workflowId (string), inputTopic (string)",
    icon: Layers,
    color: "text-sky-600 bg-sky-50 border-sky-200",
  },
  {
    name: "schedule_post",
    description:
      "Queues a post locally in the browser (Dashboard → Distribution). Headless stdio returns instructions instead of false-queuing.",
    params: "content (string), scheduledTime (ISO string), webhookUrl? (string)",
    icon: Clock,
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
];

export default function McpSuitePage() {
  const [activeIde, setActiveIde] = useState<"claude" | "cursor" | "antigravity">("cursor");
  const [copied, setCopied] = useState(false);

  const getIdeConfig = () => {
    if (activeIde === "claude") {
      return JSON.stringify(
        {
          mcpServers: {
            lunvo: {
              command: "npx",
              args: ["-y", "lunvo-mcp"],
              env: {
                GROQ_API_KEY: "your_groq_api_key_here",
                GEMINI_API_KEY: "your_gemini_api_key_here",
              },
            },
          },
        },
        null,
        2
      );
    }
    if (activeIde === "cursor") {
      return JSON.stringify(
        {
          mcpServers: {
            lunvo: {
              command: "npx",
              args: ["-y", "lunvo-mcp"],
            },
          },
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        mcpServers: {
          lunvo: {
            command: "npx",
            args: ["-y", "lunvo-mcp"],
          },
        },
      },
      null,
      2
    );
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(getIdeConfig());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        kicker="Model Context Protocol"
        title="Headless MCP Server Suite"
        description="Control LUNVO headlessly from Claude Desktop, Cursor IDE, Antigravity, or VS Code using native MCP tools."
      />

      {/* Quick Setup Card */}
      <Reveal>
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-background">
                  IDE Configuration Snippet
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Paste this JSON into your IDE configuration file.
                </p>
              </div>
            </div>

            {/* IDE selector */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-container/60 rounded-2xl border border-outline-variant/40">
              <button
                onClick={() => setActiveIde("cursor")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeIde === "cursor"
                    ? "bg-white text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-background"
                }`}
              >
                Cursor IDE
              </button>
              <button
                onClick={() => setActiveIde("claude")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeIde === "claude"
                    ? "bg-white text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-background"
                }`}
              >
                Claude Desktop
              </button>
              <button
                onClick={() => setActiveIde("antigravity")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeIde === "antigravity"
                    ? "bg-white text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-background"
                }`}
              >
                Antigravity / VS Code
              </button>
            </div>
          </div>

          {/* Config Code Box */}
          <div className="relative rounded-2xl bg-slate-950 p-5 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
            <button
              onClick={handleCopyConfig}
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans font-bold transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied!" : "Copy JSON"}</span>
            </button>
            <pre>{getIdeConfig()}</pre>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container/40 text-xs text-on-surface-variant flex items-center justify-between">
            <span>
              Config location for {activeIde === "claude" ? "Claude Desktop" : "Cursor"}:{" "}
              <code className="font-bold text-on-background">
                {activeIde === "claude"
                  ? "%APPDATA%\\Claude\\claude_desktop_config.json"
                  : ".cursor/mcp.json"}
              </code>
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              ✓ Ready for npx lunvo-mcp
            </span>
          </div>
        </div>
      </Reveal>

      {/* 8 MCP Tools Grid */}
      <Reveal>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-background uppercase tracking-wider">
              8 Headless Tools Exposed
            </h3>
            <span className="text-xs text-on-surface-variant font-mono">MCP Protocol v2.0</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MCP_TOOLS.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs space-y-3 hover:border-outline-variant/80 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${tool.color}`}
                    >
                      <ToolIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-background font-mono">
                        {tool.name}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">{tool.description}</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-container/50 font-mono text-[10px] text-on-surface-variant/90 border border-outline-variant/30 truncate">
                    <span className="font-bold text-on-background">Params:</span> {tool.params}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
