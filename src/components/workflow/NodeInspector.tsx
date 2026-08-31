"use client";

import React from "react";
import type { WorkflowNode, NodeType } from "@/lib/workflow/types";
import { X, Sliders, Sparkles, Zap, RotateCw, Share2, Trash2, Clock, Code2 } from "lucide-react";

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
      onUpdateNode({
        ...node,
        data: {
          ...node.data,
          providerOverride: provider,
          modelOverride:
            node.data.modelOverride ||
            (provider === "groq" ? "llama-3.3-70b-versatile" : "gemini-1.5-flash"),
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

  return (
    <aside className="w-80 border-l border-outline-variant/50 bg-surface-container-lowest flex flex-col h-full shadow-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container/30">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-on-background">Node Settings</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-on-surface-variant hover:text-on-background hover:bg-surface-container rounded-lg transition-colors"
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
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getNodeBadgeColor(node.type)} uppercase tracking-wider`}
            >
              {node.type.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-[11px] font-mono text-on-surface-variant/70 bg-surface-container/60 px-2 py-1 rounded-md truncate">
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
            className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
          />
        </div>

        {/* AI Agent Node Controls */}
        {isAgent && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Agent Settings</span>
            </div>

            {/* Model Provider Override */}
            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Model Override
              </label>
              <select
                value={node.data.providerOverride || "inherit"}
                onChange={handleProviderChange}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none mb-2"
              >
                <option value="inherit">Inherit Global AI Key</option>
                <option value="groq">Groq (Llama 3.3 70B Fast)</option>
                <option value="gemini">Google Gemini 1.5</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="anthropic">Anthropic Claude 3.5</option>
                <option value="ollama">Local Ollama</option>
              </select>

              {node.data.providerOverride && (
                <input
                  type="text"
                  placeholder="Custom model name"
                  value={node.data.modelOverride || ""}
                  onChange={(e) => handleDataChange("modelOverride", e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Custom Prompt Override
              </label>
              <textarea
                rows={3}
                placeholder="Optional custom system instructions..."
                value={node.data.customPrompt || ""}
                onChange={(e) => handleDataChange("customPrompt", e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none resize-none font-mono"
              />
            </div>
          </div>
        )}

        {/* Condition Gate Settings */}
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
                <option value="critic_score">Critic Score (0-100)</option>
                <option value="human_score">Human Score (0-100)</option>
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
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                  Threshold
                </label>
                <input
                  type="number"
                  value={node.data.threshold ?? 85}
                  onChange={(e) => handleDataChange("threshold", Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Max Retry Cycles
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={node.data.maxRetries ?? 2}
                onChange={(e) => handleDataChange("maxRetries", Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Webhook Settings */}
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
                onChange={(e) => handleDataChange("url", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Platform
              </label>
              <select
                value={node.data.targetPlatform || "zapier"}
                onChange={(e) => handleDataChange("targetPlatform", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              >
                <option value="zapier">Zapier Webhook</option>
                <option value="make">Make.com Scenario</option>
                <option value="buffer">Buffer Publish Queue</option>
                <option value="custom">Custom Webhook Endpoint</option>
              </select>
            </div>
          </div>
        )}

        {/* Scheduler Settings */}
        {isSchedule && (
          <div className="space-y-4 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-background">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>Schedule Timing</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                Time of Day (24h)
              </label>
              <input
                type="text"
                placeholder="09:00"
                value={node.data.timeOfDay || "09:00"}
                onChange={(e) => handleDataChange("timeOfDay", e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Action Footer */}
      <div className="p-4 border-t border-outline-variant/40 bg-surface-container/20">
        <button
          onClick={() => onDeleteNode(node.id)}
          className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Node</span>
        </button>
      </div>
    </aside>
  );
}
