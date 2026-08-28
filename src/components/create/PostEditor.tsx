"use client";

import { useState, useEffect } from "react";
import { Copy, Sparkles, Wand2, Share2, Calendar, Send, ExternalLink } from "lucide-react";
import { EngagementMeter } from "./EngagementMeter";
import { LinkedInMobilePreview } from "./LinkedInMobilePreview";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { runEngagementPredictor, EngagementMetrics } from "@/lib/ai/engagementPredictor";
import { runOptimizer } from "@/lib/ai/optimizer";
import { getActiveAIProfile } from "@/lib/apiHelper";
import { saveDraft } from "@/lib/localStore";
import { isHumanScore, humanizeWithAI, humanizeLocal } from "@/lib/ai/humanizer";
import {
  copyAndOpenLinkedIn,
  shareViaWebShare,
  dispatchToWebhook,
  downloadICS,
  copyToClipboard,
} from "@/lib/distribution/clipboard";

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
  const [humanScore, setHumanScore] = useState(() => isHumanScore(content));
  const [humanizerOn, setHumanizerOn] = useState(false);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [originalBeforeHumanize, setOriginalBeforeHumanize] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [webhookSent, setWebhookSent] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(editedContent);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLinkedIn = async () => {
    const ok = await copyAndOpenLinkedIn(editedContent);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    const ok = await shareViaWebShare(editedContent);
    setIsSharing(false);
    if (!ok) {
      // fallback to copy
      await handleCopy();
    }
  };

  const handleWebhook = async () => {
    // Try all configured distribution webhooks (Zapier/Twitter/Reddit)
    const urls = [
      typeof window !== "undefined" ? localStorage.getItem("lunvo_dist_zapier") : null,
      typeof window !== "undefined" ? localStorage.getItem("lunvo_dist_twitter") : null,
      typeof window !== "undefined" ? localStorage.getItem("lunvo_dist_reddit") : null,
      typeof window !== "undefined" ? localStorage.getItem("lunvo_webhook_url") : null,
    ].filter(Boolean) as string[];
    if (urls.length === 0) {
      alert("No webhook configured — add one in Distribute → Save a webhook URL first.");
      return;
    }
    let ok = false;
    for (const url of urls) {
      const res = await dispatchToWebhook(url, { platform: "linkedin", content: editedContent });
      ok = ok || res;
    }
    setWebhookSent(ok);
    setTimeout(() => setWebhookSent(false), 2000);
    if (!ok) alert("Webhook failed — check URL and try again.");
  };

  const handleDownloadICS = () => {
    downloadICS(editedContent);
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

  // Keep human score in sync when content changes (unless humanizing)
  useEffect(() => {
    if (!isHumanizing) setHumanScore(isHumanScore(editedContent));
  }, [editedContent, isHumanizing]);

  const handleHumanizerToggle = async (nextOn: boolean) => {
    if (nextOn) {
      setOriginalBeforeHumanize(editedContent);
      setIsHumanizing(true);
      try {
        const profile = getActiveAIProfile();
        const humanized = profile
          ? await humanizeWithAI(editedContent, profile)
          : humanizeLocal(editedContent);
        setEditedContent(humanized);
        setHumanScore(isHumanScore(humanized));
        // Re-run prediction on humanized text
        setMetrics(null);
      } catch (e) {
        console.error("Humanize failed", e);
        // fallback local
        const fallback = humanizeLocal(editedContent);
        setEditedContent(fallback);
        setHumanScore(isHumanScore(fallback));
      } finally {
        setIsHumanizing(false);
        setHumanizerOn(true);
      }
    } else {
      // Revert
      if (originalBeforeHumanize) {
        setEditedContent(originalBeforeHumanize);
        setHumanScore(isHumanScore(originalBeforeHumanize));
        setMetrics(null);
      }
      setHumanizerOn(false);
      setOriginalBeforeHumanize(null);
    }
  };

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
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-container-high text-on-surface-variant rounded-md text-xs font-medium hover:bg-surface-container-highest transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
              <button
                onClick={handleCopyLinkedIn}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition-colors"
                title="Copy & open LinkedIn (1 tap)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Copy → LinkedIn</span>
              </button>
            </div>
          </div>
          <TiptapEditor
            content={editedContent}
            onChange={(text) => {
              setEditedContent(text);
              setMetrics(null); // Clear metrics if they edit manually
            }}
          />
          {/* Distribution bar — 1-click copy + share + webhook + .ics */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-outline-variant/30 bg-surface-container-low/50">
            <span className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mr-1">
              Distribute:
            </span>
            <button
              onClick={handleCopyLinkedIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              <Copy className="w-3 h-3" /> Copy → LinkedIn
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold hover:bg-surface-container-highest transition-colors disabled:opacity-40"
            >
              <Share2 className="w-3 h-3" /> {isSharing ? "Sharing…" : "Share"}
            </button>
            <button
              onClick={handleWebhook}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 transition-colors ${webhookSent ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-white text-on-surface-variant ring-outline-variant/40 hover:text-primary"}`}
            >
              <Send className="w-3 h-3" /> {webhookSent ? "Sent!" : "Webhook"}
            </button>
            <button
              onClick={handleDownloadICS}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-on-surface-variant ring-1 ring-outline-variant/40 text-xs font-bold hover:text-primary transition-colors"
            >
              <Calendar className="w-3 h-3" /> .ics
            </button>
          </div>
        </div>

        {/* Humanizer — Moat #2 */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${humanizerOn ? "bg-primary justify-end" : "bg-surface-container-high justify-start"}`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </span>
              <button
                onClick={() => handleHumanizerToggle(!humanizerOn)}
                disabled={isHumanizing}
                className={`text-xs font-bold uppercase tracking-wider ${humanizerOn ? "text-primary" : "text-on-surface-variant"}`}
              >
                Humanizer {humanizerOn ? "ON" : "OFF"}
              </button>
              {isHumanizing && (
                <span className="text-xs text-on-surface-variant/60 animate-pulse">
                  Humanizing…
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`px-2.5 py-1 rounded-full text-[0.6875rem] font-bold font-mono ring-1 ${humanScore >= 90 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : humanScore >= 70 ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-surface-container-high text-on-surface-variant ring-outline-variant/30"}`}
              >
                {humanScore}% human
              </div>
              <div className="w-20 h-1.5 rounded-full bg-surface-container overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${humanScore >= 90 ? "bg-emerald-500" : humanScore >= 70 ? "bg-amber-500" : "bg-surface-container-highest"}`}
                  style={{ width: `${humanScore}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-[0.6875rem] text-on-surface-variant/60 mt-2 leading-relaxed">
            Banned phrases removed + burstiness varied. Toggle ON → 90% human. Uses your BYOK key if
            set, else local heuristic.
          </p>
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
