"use client";

import React, { useState } from "react";
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  X,
  Sparkles,
  Zap,
  Layers,
} from "lucide-react";
import type { Workflow, NodeExecutionStatus } from "@/lib/workflow/types";
import { executeWorkflow } from "@/lib/workflow/workflowRunner";
import { getActiveAIProfile } from "@/lib/apiHelper";
import { getVoiceDNA } from "@/lib/voice-dna/memory";
import Link from "next/link";

interface RunWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow;
}

const SAMPLE_TOPICS = [
  "Why 90% of AI agent startups will fail in 2026",
  "How we scaled an open-source tool to 50k users with zero ad spend",
  "The real reason why simple code beats complex microservices",
  "3 lessons learned after refactoring 10,000 lines of legacy code",
];

export function RunWorkflowModal({ isOpen, onClose, workflow }: RunWorkflowModalProps) {
  const [topic, setTopic] = useState("Why simple code beats complex microservices in 2026");
  const [isRunning, setIsRunning] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<
    Record<string, { status: NodeExecutionStatus; output?: any }>
  >({});
  const [executionResult, setExecutionResult] = useState<{
    draft: string;
    criticScore?: number;
    humanScore?: number;
    error?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRun = async () => {
    if (!topic.trim()) return;
    setIsRunning(true);
    setExecutionResult(null);
    setStepStatuses({});

    try {
      const profile = getActiveAIProfile() || {
        provider: "local",
        apiKey: "local-key",
        model: "llama-3.3-70b",
      };
      const voiceDna = getVoiceDNA();

      const result = await executeWorkflow({
        workflow,
        profile,
        topic: topic.trim(),
        voiceDna,
        onStepUpdate: (nodeId, status, output) => {
          setStepStatuses((prev) => ({
            ...prev,
            [nodeId]: { status, output },
          }));
        },
      });

      setExecutionResult({
        draft: result.currentDraft || "",
        criticScore: result.criticResult?.finalScore,
        humanScore: result.humanScore,
      });
    } catch (err: any) {
      setExecutionResult({
        draft: "",
        error: err?.message || "Execution failed",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    if (executionResult?.draft) {
      navigator.clipboard.writeText(executionResult.draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/60 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-background flex items-center gap-2">
                <span>Run Live Workflow</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {workflow.metadata.name}
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant">
                Topological execution of {workflow.nodes.length} connected pipeline nodes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-background rounded-xl hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-background uppercase tracking-wider">
              Input Topic or Seed Idea
            </label>
            <textarea
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isRunning}
              placeholder="Enter what you want this workflow to write about..."
              className="w-full px-4 py-3 rounded-2xl border border-outline-variant/80 bg-surface-container-lowest text-on-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
            />

            {/* Quick Topic Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1 self-center">
                <Sparkles className="w-3 h-3 text-amber-500" /> Ideas:
              </span>
              {SAMPLE_TOPICS.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(t)}
                  disabled={isRunning}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-background transition-colors text-left truncate max-w-[260px]"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Node Execution Steps List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-background uppercase tracking-wider flex items-center justify-between">
              <span>Pipeline Steps ({workflow.nodes.length})</span>
              {isRunning && (
                <span className="text-xs font-semibold text-primary flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Processing nodes...
                </span>
              )}
            </label>
            <div className="space-y-2 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/40">
              {workflow.nodes.map((node, idx) => {
                const step = stepStatuses[node.id];
                const status = step?.status || "pending";

                return (
                  <div
                    key={node.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs ${
                      status === "running"
                        ? "bg-primary/5 border-primary/40 shadow-xs"
                        : status === "success"
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                          : status === "failed"
                            ? "bg-rose-50/50 border-rose-200 text-rose-900"
                            : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-surface-container font-mono text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold">{node.data.label || node.type}</span>
                    </div>

                    <div>
                      {status === "running" && (
                        <div className="flex items-center gap-1.5 text-primary font-bold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Running</span>
                        </div>
                      )}
                      {status === "success" && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </div>
                      )}
                      {status === "failed" && (
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Error</span>
                        </div>
                      )}
                      {status === "pending" && (
                        <span className="text-[11px] text-on-surface-variant/60">Waiting</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution Result Box */}
          {executionResult && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-on-background uppercase tracking-wider">
                  Generated Output Draft
                </label>
                <div className="flex items-center gap-2">
                  {executionResult.criticScore && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">
                      Critic: {executionResult.criticScore}/100
                    </span>
                  )}
                  {executionResult.humanScore && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      Human: {executionResult.humanScore}%
                    </span>
                  )}
                </div>
              </div>

              {executionResult.error ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {executionResult.error}
                </div>
              ) : (
                <div className="relative group">
                  <pre className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 text-on-background text-xs font-sans whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {executionResult.draft}
                  </pre>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-surface-container-highest text-on-background hover:bg-surface-container transition-colors shadow-xs"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <Link
                      href="/dashboard/create"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Studio</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/40 bg-surface-container-low flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-background hover:bg-surface-container transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || !topic.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Workflow...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
