"use client";

import { useState, useEffect } from "react";
import { Copy, Sparkles, Wand2 } from "lucide-react";
import { EngagementMeter } from "./EngagementMeter";
import { LinkedInMobilePreview } from "./LinkedInMobilePreview";
import { runEngagementPredictor, EngagementMetrics } from "@/lib/ai/engagementPredictor";
import { runOptimizer } from "@/lib/ai/optimizer";
import { getActiveAIProfile } from "@/lib/apiHelper";
import { saveDraft } from "@/lib/localStore";

interface PostEditorProps {
  content: string;
  score: number; // Initial score from Critic Agent
  notes: string[];
}

export function PostEditor({ content, score, notes }: PostEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizerInstruction, setOptimizerInstruction] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePredict = async () => {
    const profile = getActiveAIProfile();
    if (!profile) return;

    setIsPredicting(true);
    try {
      const res = await runEngagementPredictor(profile, editedContent);
      setMetrics(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleOptimize = async () => {
    const profile = getActiveAIProfile();
    if (!profile || !optimizerInstruction.trim()) return;

    setIsOptimizing(true);
    try {
      const optimized = await runOptimizer(profile, editedContent, optimizerInstruction);
      setEditedContent(optimized);
      setOptimizerInstruction("");
      // Clear metrics so they can run it again on new text
      setMetrics(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Run initial prediction when component mounts
  useEffect(() => {
    handlePredict();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Editor & Optimizer */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface-container-low">
            <h2 className="text-sm font-semibold flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-emerald-500" />
              Final Post Editor
            </h2>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <textarea
            value={editedContent}
            onChange={(e) => {
              setEditedContent(e.target.value);
              setMetrics(null); // Clear metrics if they edit manually
            }}
            className="w-full flex-1 min-h-[300px] p-6 bg-transparent resize-none outline-none text-on-background leading-relaxed font-sans"
          />
        </div>

        {/* 1-Click Optimizer */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 shadow-sm">
          <label className="block text-xs font-semibold text-on-surface dark:text-on-surface-variant/40 mb-2 flex items-center">
            <Wand2 className="w-3.5 h-3.5 mr-1" />
            1-Click AI Optimizer
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={optimizerInstruction}
              onChange={(e) => setOptimizerInstruction(e.target.value)}
              placeholder='E.g., "Make the hook punchier" or "Shorten it"'
              className="flex-1 rounded-md border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleOptimize}
              disabled={isOptimizing || !optimizerInstruction.trim()}
              className="px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-md text-sm font-medium hover:bg-surface-container-highest disabled:opacity-50 transition-colors"
            >
              {isOptimizing ? "Optimizing..." : "Apply"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Previews & Diagnostics */}
      <div className="lg:col-span-5 space-y-6">
        {/* Engagement Predictor Widget */}
        <div className="relative">
          <EngagementMeter metrics={metrics} isLoading={isPredicting} />
          {!metrics && !isPredicting && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-10 border border-transparent">
              <button
                onClick={handlePredict}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
              >
                Run Prediction Audit
              </button>
            </div>
          )}
        </div>

        {/* LinkedIn Mobile Simulator */}
        <div>
          <h3 className="text-sm font-semibold text-on-background dark:text-white mb-3">
            Mobile Preview (Truncation Check)
          </h3>
          <LinkedInMobilePreview content={editedContent} />
        </div>
      </div>
    </div>
  );
}
