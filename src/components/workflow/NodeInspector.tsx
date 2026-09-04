"use client";

import React from "react";
import type { WorkflowNode, NodeType } from "@/lib/workflow/types";
import { PROVIDER_REGISTRY, getProviderDef } from "@/lib/ai/providers/registry";
import {
  X,
  Sliders,
  Sparkles,
  Zap,
  RotateCw,
  Share2,
  Trash2,
  Clock,
  Code2,
  Rss,
  Layers,
  FileText,
  Volume2,
  ShieldCheck,
  Repeat,
  Youtube,
  Send,
  StickyNote,
  Timer,
} from "lucide-react";

interface NodeInspectorProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onUpdateNode: (updatedNode: WorkflowNode) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function NodeInspector({ node, onClose, onUpdateNode, onDeleteNode }: NodeInspectorProps) {
  if (!node) return null;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNode({
      ...node,
      data: {
        ...node.data,
        label: e.target.value,
      },
    });
  };

  const handleDataChange = (key: string, value: any) => {
    onUpdateNode({
      ...node,
      data: {
        ...node.data,
        [key]: value,
      },
    });
  };

  // Number fields must never become NaN (empty input → Number("") === 0 would
  // silently rewrite thresholds). Clamp into the control's own min/max.
  const handleNumberChange = (
    key: string,
    raw: string,
    fallback: number,
    min: number,
    max: number
  ) => {
    const n = raw.trim() === "" ? fallback : Number(raw);
    handleDataChange(key, Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback);
  };

  const isValidTimeOfDay = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v.trim());

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value;
    if (provider === "inherit") {
      onUpdateNode({
        ...node,
        data: {
          ...node.data,
          providerOverride: undefined,
          modelOverride: undefined,
        },
      });
    } else {
      const def = getProviderDef(provider);
      onUpdateNode({
        ...node,
        data: {
          ...node.data,
          providerOverride: provider,
          modelOverride: node.data.modelOverride || def?.defaultModel || "gemini-2.0-flash",
        },
      });
    }
  };

  const getNodeBadgeColor = (type: NodeType) => {
    if (type.startsWith("trigger_")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (type.startsWith("agent_")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (type.includes("transform") || type.includes("formatter") || type.includes("filter"))
      return "bg-amber-100 text-amber-800 border-amber-200";
    if (type === "condition_gate") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (type.startsWith("output_")) return "bg-rose-100 text-rose-800 border-rose-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const isAgent = node.type.startsWith("agent_");
  const isCondition = node.type === "condition_gate";
  const isWebhook = node.type === "output_webhook";
  const isSchedule = node.type === "trigger_schedule";
  const isRss = node.type === "trigger_rss";
  const isCarousel = node.type === "carousel_formatter";
  const isHumanizer = node.type === "humanizer_filter";
  const isRepurpose = node.type === "repurpose_transformer";
  const isVoiceDna = node.type === "voice_dna_transform";
  const isDraftStore = node.type === "output_draft_store";
  const isYouTube = node.type === "trigger_youtube";
  const isTelegram = node.type === "trigger_telegram";
  const isNote = node.type === "note_sticky";
  const isDelay = node.type === "delay_timer";

  return (
    <aside className="w-[336px] max-w-[90vw] shrink-0 border-l border-outline-variant/50 bg-surface-container-lowest flex flex-col h-full shadow-2xl z-30 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container/30">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-on-background">Node Settings</h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close node inspector"
          className="p-1.5 text-on-surface-variant hover:text-on-background hover:bg-surface-container rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body / Configuration Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Node Type & ID */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Type
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getNodeBadgeColor(node.type)} uppercase tracking-wider`}
            >
              {node.type.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-[11px] font-mono text-on-surface-variant/70 bg-surface-container/60 px-2.5 py-1 rounded-md truncate">
            ID: {node.id}
          </p>
        </div>

        {/* Node Label */}
        <div>
          <label className="block text-xs font-bold text-on-background mb-1.5">Node Label</label>
          <input
            type="text"
            value={node.data.label || ""}
            onChange={handleLabelChange}
            maxLength={80}
            className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Description (hover tooltip on canvas) */}
        <div>
          <label className="block text-xs font-bold text-on-background mb-1.5">
            Description{" "}
            <span className="font-medium text-on-surface-variant/60">(canvas tooltip)</span>
          </label>
          <textarea
            rows={2}
            placeholder="What does this step do? Shown on hover over the node…"
            value={node.data.description || ""}
            onChange={(e) => handleDataChange("description", e.target.value.slice(0, 300))}
            className="w-full text-xs p-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* Precise Position */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
              Position X
            </label>
            <input
              type="number"
              value={Math.round(node.position.x)}
              onChange={(e) => {
                const n = e.target.value.trim() === "" ? node.position.x : Number(e.target.value);
                if (!Number.isFinite(n)) return;
                onUpdateNode({
                  ...node,
                  position: { x: Math.round(n), y: Math.round(node.position.y) },
                });
              }}
              className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
              Position Y
            </label>
            <input
              type="number"
              value={Math.round(node.position.y)}
              onChange={(e) => {
                const n = e.target.value.trim() === "" ? node.position.y : Number(e.target.value);
                if (!Number.isFinite(n)) return;
                onUpdateNode({
                  ...node,
                  position: { x: Math.round(node.position.x), y: Math.round(n) },
                });
              }}
              className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* 1. AI Agent Node Controls */}
        {isAgent && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Agent Settings</span>
            </div>

            {/* Model Provider Override */}
            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Model Provider Override
              </label>
              <select
                value={node.data.providerOverride || "inherit"}
                onChange={handleProviderChange}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none mb-2"
              >
                <option value="inherit">Inherit Global Key Vault</option>
                {PROVIDER_REGISTRY.filter((p) => !p.coming).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.local ? " (Local)" : ""}
                    {p.freeTier ? " · Free" : ""}
                  </option>
                ))}
              </select>

              {node.data.providerOverride && (
                <input
                  type="text"
                  placeholder="Custom model ID (e.g. llama-3.3-70b-versatile)"
                  value={node.data.modelOverride || ""}
                  onChange={(e) => handleDataChange("modelOverride", e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
                />
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-on-surface-variant">
                  Temperature ({node.data.temperature ?? "agent default"})
                </label>
                {node.data.temperature !== undefined && (
                  <button
                    onClick={() => {
                      const { temperature: _dropped, ...rest } = node.data;
                      onUpdateNode({ ...node, data: rest });
                    }}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={node.data.temperature ?? 0.7}
                onChange={(e) => handleDataChange("temperature", parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Custom System Prompt Instructions
              </label>
              <textarea
                rows={3}
                placeholder="Optional custom system instructions for this specific step..."
                value={node.data.customPrompt || ""}
                onChange={(e) => handleDataChange("customPrompt", e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none resize-none font-mono"
              />
            </div>
          </div>
        )}

        {/* 2. Condition Gate Settings */}
        {isCondition && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gatekeeper Condition</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Evaluation Metric
              </label>
              <select
                value={node.data.field || "critic_score"}
                onChange={(e) => handleDataChange("field", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              >
                <option value="critic_score">Critic Virality Score (0-100)</option>
                <option value="human_score">Anti-AI Human Score (0-100)</option>
                <option value="character_count">Character Count</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                  Operator
                </label>
                <select
                  value={node.data.operator || "gte"}
                  onChange={(e) => handleDataChange("operator", e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
                >
                  <option value="gte">&gt;= (Greater or Equal)</option>
                  <option value="gt">&gt; (Greater than)</option>
                  <option value="lte">&lt;= (Less or Equal)</option>
                  <option value="lt">&lt; (Less than)</option>
                  <option value="eq">= (Exactly equal)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                  Threshold
                </label>
                <input
                  type="number"
                  value={node.data.threshold ?? 85}
                  onChange={(e) => handleNumberChange("threshold", e.target.value, 85, 0, 100000)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Max Retry Cycles (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={node.data.maxRetries ?? 2}
                onChange={(e) => handleNumberChange("maxRetries", e.target.value, 2, 1, 5)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 3. Webhook Settings */}
        {isWebhook && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Share2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Webhook Dispatcher</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Target Webhook URL (Zapier / Make / Buffer)
              </label>
              <input
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={node.data.url || ""}
                onChange={(e) => handleDataChange("url", e.target.value.slice(0, 500))}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
              {node.data.url && !/^https?:\/\/.+\..+/.test(node.data.url.trim()) && (
                <p className="text-[10px] text-amber-600 mt-1">
                  Doesn't look like a valid http(s) URL — dispatch will be blocked.
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Secret Token{" "}
                <span className="text-on-surface-variant/60">(sent as X-Webhook-Token)</span>
              </label>
              <input
                type="password"
                placeholder="Optional shared secret…"
                value={node.data.secretToken || ""}
                autoComplete="off"
                onChange={(e) => handleDataChange("secretToken", e.target.value.slice(0, 256))}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Platform Preset
              </label>
              <select
                value={node.data.targetPlatform || "zapier"}
                onChange={(e) => handleDataChange("targetPlatform", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              >
                <option value="zapier">Zapier Webhook</option>
                <option value="make">Make.com Scenario</option>
                <option value="buffer">Buffer Publish Queue</option>
                <option value="custom">Custom JSON Webhook Endpoint</option>
              </select>
            </div>
          </div>
        )}

        {/* 4. Scheduler Settings */}
        {isSchedule && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>Schedule Timing</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Time of Day (24h, HH:MM)
              </label>
              <input
                type="text"
                placeholder="09:00"
                value={node.data.timeOfDay || "09:00"}
                onChange={(e) => handleDataChange("timeOfDay", e.target.value.slice(0, 5))}
                className={`w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border focus:outline-none ${
                  isValidTimeOfDay(node.data.timeOfDay || "09:00")
                    ? "border-outline-variant/60 focus:border-primary"
                    : "border-amber-500 focus:border-amber-500"
                }`}
              />
              {!isValidTimeOfDay(node.data.timeOfDay || "09:00") && (
                <p className="text-[10px] text-amber-600 mt-1">Use HH:MM (00:00–23:59).</p>
              )}
            </div>
          </div>
        )}

        {/* 5. RSS Trigger Settings */}
        {isRss && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Rss className="w-3.5 h-3.5 text-orange-600" />
              <span>RSS / News Feed Stream</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Category Feed
              </label>
              <select
                value={node.data.category || "tech"}
                onChange={(e) => handleDataChange("category", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              >
                <option value="tech">Tech & Software</option>
                <option value="ai">Artificial Intelligence & LLMs</option>
                <option value="saas">SaaS & Startups</option>
                <option value="general">Business & Growth</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Search Query / Keywords{" "}
                <span className="text-on-surface-variant/60">(blank = use Category)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Next.js 15, AI agents"
                value={node.data.query || ""}
                onChange={(e) => handleDataChange("query", e.target.value.slice(0, 200))}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Max Articles (1-10)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={node.data.limit ?? 3}
                onChange={(e) => handleNumberChange("limit", e.target.value, 3, 1, 10)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 6. Carousel Formatter */}
        {isCarousel && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Carousel Formatter Settings</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Slide Count (3-10)
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={node.data.slideCount ?? 5}
                onChange={(e) => handleNumberChange("slideCount", e.target.value, 5, 3, 10)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Visual Theme
              </label>
              <select
                value={node.data.theme || "aurora"}
                onChange={(e) => handleDataChange("theme", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              >
                <option value="aurora">Light Aurora (Recommended)</option>
                <option value="dark">Dark Minimalist</option>
                <option value="editorial">Warm Editorial</option>
              </select>
            </div>
          </div>
        )}

        {/* 7. Anti-AI Humanizer Filter */}
        {isHumanizer && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Anti-AI Slop Humanizer</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Strictness Mode
              </label>
              <select
                value={node.data.strictness || "balanced"}
                onChange={(e) => handleDataChange("strictness", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              >
                <option value="aggressive">Aggressive (Eliminate all 48 clichés)</option>
                <option value="balanced">Balanced (Natural conversational flow)</option>
                <option value="minimal">Minimal (Light touch)</option>
              </select>
            </div>
          </div>
        )}

        {/* 8. Voice DNA Transformation */}
        {isVoiceDna && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Voice DNA Ingest</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Tone Persona Override
              </label>
              <select
                value={node.data.tonePersona || "default"}
                onChange={(e) => handleDataChange("tonePersona", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              >
                <option value="default">Use Trained Voice DNA</option>
                <option value="contrarian">Contrarian & Direct</option>
                <option value="storyteller">Vulnerable Storyteller</option>
                <option value="analytical">Data-Backed Analytical</option>
              </select>
            </div>
          </div>
        )}

        {/* 9. Repurpose Transformer */}
        {isRepurpose && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Repeat className="w-3.5 h-3.5 text-amber-600" />
              <span>Repurpose Formats</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Target Format
              </label>
              <select
                value={node.data.format || "linkedin_variants"}
                onChange={(e) => handleDataChange("format", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              >
                <option value="linkedin_variants">3 LinkedIn Hook Variations</option>
                <option value="twitter_thread">Twitter / X Thread (5 tweets)</option>
                <option value="newsletter">Executive Email Newsletter</option>
                <option value="short_script">60s Short-Form Video Script</option>
              </select>
            </div>
          </div>
        )}

        {/* 10. Local Draft Store */}
        {isDraftStore && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Local Draft Storage</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Save Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Automated Pipeline"
                value={node.data.tag || "Automated Draft"}
                onChange={(e) => handleDataChange("tag", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 11. YouTube & Telegram Triggers */}
        {isYouTube && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              <span>YouTube Trigger</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Video URL
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={node.data.youtubeUrl || ""}
                onChange={(e) => handleDataChange("youtubeUrl", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {isTelegram && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Send className="w-3.5 h-3.5 text-sky-600" />
              <span>Telegram Trigger</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Allowed Command
              </label>
              <input
                type="text"
                placeholder="/workflow"
                value={node.data.telegramCommand || "/workflow"}
                onChange={(e) => handleDataChange("telegramCommand", e.target.value.slice(0, 60))}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 12. Sticky Note (annotation, zero AI cost) */}
        {isNote && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <StickyNote className="w-3.5 h-3.5 text-yellow-600" />
              <span>Sticky Note</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Note Text
              </label>
              <textarea
                rows={4}
                placeholder="Document this flow: assumptions, TODOs, owner…"
                value={node.data.note || ""}
                onChange={(e) => handleDataChange("note", e.target.value.slice(0, 2000))}
                className="w-full text-xs p-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Note Color
              </label>
              <select
                value={node.data.color || "yellow"}
                onChange={(e) => handleDataChange("color", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              >
                <option value="yellow">Yellow</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="pink">Pink</option>
              </select>
            </div>
          </div>
        )}

        {/* 13. Delay Timer (bounded wait between steps) */}
        {isDelay && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Timer className="w-3.5 h-3.5 text-slate-600" />
              <span>Delay Timer</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Wait Seconds (1-120)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={node.data.seconds ?? 5}
                onChange={(e) => handleNumberChange("seconds", e.target.value, 5, 1, 120)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
              <p className="text-[10px] text-on-surface-variant/60 mt-1">
                Capped at 120s so a typo can't hang a run past platform timeouts.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Action Footer */}
      <div className="p-4 border-t border-outline-variant/40 bg-surface-container/20">
        <button
          onClick={() => onDeleteNode(node.id)}
          className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Node</span>
        </button>
      </div>
    </aside>
  );
}
