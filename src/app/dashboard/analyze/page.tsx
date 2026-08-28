"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { getApiHeaders, getActiveAIProfile } from "@/lib/apiHelper";
import { buildAnalyzePrompt } from "@/lib/ai/prompts";
import { unifiedAI } from "@/lib/ai/router.unified";
import { parseAIJson } from "@/lib/ai/router";
import { AnalyzeResultSchema } from "@/lib/ai/schemas";
import { predictEngagementRate } from "@/lib/ai/scoringEngine";
import { setLastER, setLastHook, incrementUsage } from "@/lib/localStore";
import PageHeader from "@/components/premium/PageHeader";

// --- Types ---
interface Score {
  score: number;
  label: string;
  explanation: string;
}

interface AnalysisResult {
  scores: {
    hook: Score;
    readability: Score;
    engagement: Score;
    structure: Score;
  };
  overall_score: number;
  top_problems: string[];
  improved_post: string;
  improvement_summary: string;
  predictedEngagementRate?: number;
  hookScore?: number;
}

export default function AnalyzePostPage() {
  const [view, setView] = useState<"input" | "loading" | "results">("input");
  const [postContent, setPostContent] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  useEffect(() => {
    // Check for content in URL
    if (typeof window === "undefined") return;
    const content = new URLSearchParams(window.location.search).get("content");
    if (content) {
      setPostContent(decodeURIComponent(content));
    }
  }, []);

  const computeLiveER = (post: string, data: AnalysisResult): number => {
    const hashtagCount = (post.match(/#\w+/g) || []).length;
    const metrics = {
      contentLength: post.length,
      hasHashtags: hashtagCount > 0,
      hashtagCount,
      postType: "text" as const,
      dayOfWeek: new Date().toLocaleDateString("en-US", { weekday: "long" }),
      postHour: new Date().getHours(),
      hasMedia: false,
      hookQuality: data.scores.hook.score,
      ctaSpecificity: data.scores.engagement.score,
    };
    const live = predictEngagementRate(metrics);
    return live.predictedEngagementRate;
  };

  const handleAnalyze = async () => {
    if (postContent.trim().length < 20) return;
    setView("loading");

    try {
      const profile = getActiveAIProfile();

      let data: AnalysisResult;

      // Local-first: if BYOK profile exists, analyze directly client-side (no /api/analyze needed)
      if (profile && profile.apiKey && profile.apiKey !== "REDACTED_LOCAL_ONLY") {
        const systemPrompt = buildAnalyzePrompt(
          postContent,
          "Professional",
          "Growth",
          "Professional"
        );
        // buildAnalyzePrompt already includes post, but unifiedAI expects system+user split
        // Use empty system and full prompt as user for simplicity — prompt already self-contained
        const res = await unifiedAI({
          profile,
          messages: [{ role: "user", content: systemPrompt }],
          temperature: 0.3,
          maxTokens: 1400,
        });
        const parsed = parseAIJson<AnalysisResult>(res.text);
        const validated = AnalyzeResultSchema.safeParse(parsed);
        if (!validated.success) throw new Error("AI returned invalid analysis JSON");
        data = validated.data as AnalysisResult;
      } else {
        // Fallback: try server API (if exists), else use local heuristic mock
        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: getApiHeaders(),
            body: JSON.stringify({ post: postContent }),
          });
          if (response.status === 429) {
            alert("Rate limit exceeded. Please check your API settings.");
            setView("input");
            return;
          }
          const json = await response.json();
          if (!response.ok) throw new Error(json.error || "Failed to analyze post");
          data = json as AnalysisResult;
        } catch {
          // Local heuristic fallback — no API and no BYOK: synthesize scores from heuristics
          const hook =
            (postContent.split("\n")[0]?.length ?? 0) > 20 && !postContent.startsWith("I ") ? 7 : 4;
          data = {
            scores: {
              hook: {
                score: hook,
                label: hook > 6 ? "Good" : "Weak",
                explanation: "Hook estimated locally (no AI key)",
              },
              readability: {
                score: 6,
                label: "Good",
                explanation: "Readability estimated locally",
              },
              engagement: {
                score: postContent.includes("?") ? 7 : 4,
                label: postContent.includes("?") ? "Good" : "Weak",
                explanation: "CTA check locally",
              },
              structure: { score: 6, label: "Good", explanation: "Structure estimated locally" },
            },
            overall_score: 6,
            top_problems: ["Add specific CTA question", "Shorten first line for hook"],
            improved_post: postContent,
            improvement_summary: "Local heuristic analysis — add BYOK key for full AI audit",
          };
        }
      }

      // Phase 21: attach live ER + Hook (scoringEngine) — replaces hard 94%
      const er = computeLiveER(postContent, data);
      data.predictedEngagementRate = er;
      data.hookScore = data.scores.hook.score;

      // persist for dashboard
      setLastER(er);
      setLastHook(data.scores.hook.score);
      incrementUsage("analyze");

      setResult(data);
      setView("results");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Analysis failed:", error);
      alert(msg || "An error occurred during analysis.");
      setView("input");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {/* INPUT */}
        {view === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="pt-2">
              <PageHeader
                kicker="Analysis Engine"
                divider={false}
                title={
                  <>
                    Audit your <em className="italic">post.</em>
                  </>
                }
                description="Paste any LinkedIn post. Get a full editorial breakdown in seconds."
              />
            </div>

            <div className="bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium focus-within:ring-primary/30 transition-all">
              <textarea
                placeholder="Paste your LinkedIn post here..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full min-h-[220px] bg-transparent border-none focus:ring-0 text-[1rem] font-mono resize-none p-6 leading-relaxed text-on-background placeholder:text-on-surface-variant/30 outline-none"
              />
              <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(229,226,218,0.4)]">
                <span className="text-[0.6875rem] font-bold font-mono text-on-surface-variant/40 uppercase tracking-widest">
                  {postContent.length} chars — min 20
                </span>
                <button
                  onClick={handleAnalyze}
                  disabled={postContent.trim().length < 20}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none text-on-primary px-7 py-3 rounded-lg font-bold text-[0.875rem] shadow-premium transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  Run analysis <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* LOADING */}
        {view === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
            <h2 className="text-xl font-serif text-on-background mb-2">
              Running editorial analysis...
            </h2>
            <div className="mt-6 space-y-3 w-full max-w-xs">
              <div className="h-2 bg-surface-container rounded-full animate-pulse w-4/5" />
              <div className="h-2 bg-surface-container rounded-full animate-pulse w-full" />
              <div className="h-2 bg-surface-container rounded-full animate-pulse w-3/5" />
            </div>
          </motion.div>
        )}

        {/* RESULTS */}
        {view === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Back nav + Overall Score */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2 pb-8 border-b border-outline-variant/40">
              <div>
                <button
                  onClick={() => setView("input")}
                  className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60 hover:text-primary transition-colors font-mono mb-4"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> New Analysis
                </button>
                <h2 className="text-4xl sm:text-5xl font-serif text-on-background tracking-tight leading-[1.05]">
                  Editorial <em className="italic">report.</em>
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-surface-container-lowest rounded-[12px] p-5 ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium flex items-center gap-5">
                  <div>
                    <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-1">
                      Overall Quality
                    </div>
                    <div
                      className={`text-4xl font-serif leading-none ${
                        (result?.overall_score ?? 0) <= 4
                          ? "text-error"
                          : (result?.overall_score ?? 0) <= 6
                            ? "text-tertiary"
                            : "text-secondary"
                      }`}
                    >
                      {result?.overall_score}
                      <span className="text-xl text-on-surface-variant/30">/10</span>
                    </div>
                  </div>
                </div>
                {/* Phase 21: Live ER + Hook */}
                {result?.predictedEngagementRate !== undefined && (
                  <div className="bg-zinc-950 rounded-[12px] p-5 shadow-premium flex items-center gap-6 text-white">
                    <div>
                      <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-white/50 font-mono mb-1">
                        Hook
                      </div>
                      <div className="text-2xl font-serif leading-none">
                        {result.hookScore ?? result.scores.hook.score}
                        <span className="text-base text-white/30">/10</span>
                      </div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div>
                      <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-white/50 font-mono mb-1">
                        Predicted ER
                      </div>
                      <div className="text-2xl font-serif leading-none">
                        {result.predictedEngagementRate.toFixed(1)}
                        <span className="text-base text-white/30">%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {result &&
                Object.entries(result.scores).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-surface-container-lowest rounded-[12px] p-6 ring-1 ring-[rgba(229,226,218,0.4)] hover:shadow-premium transition-all"
                  >
                    <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-3">
                      {key}
                    </div>
                    <div
                      className={`text-3xl font-serif mb-3 ${
                        value.score <= 4
                          ? "text-error"
                          : value.score <= 6
                            ? "text-tertiary"
                            : "text-secondary"
                      }`}
                    >
                      {value.score}
                      <span className="text-base text-on-surface-variant/30">/10</span>
                    </div>
                    <p className="text-[0.8125rem] font-medium text-on-surface-variant leading-relaxed">
                      {value.explanation}
                    </p>
                  </div>
                ))}
            </div>

            {/* Problems + Rewrite */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Problems */}
              <div className="bg-surface-container-lowest rounded-[12px] p-7 ring-1 ring-[rgba(229,226,218,0.4)] shadow-premium border-l-2 border-error">
                <div className="flex items-center gap-2 text-error font-bold mb-5 text-[0.875rem] uppercase tracking-wider font-mono">
                  <AlertCircle className="w-4 h-4" /> Identify & Eliminate
                </div>
                <ul className="space-y-4">
                  {result?.top_problems.map((problem, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-on-surface font-medium text-[0.9375rem] leading-relaxed"
                    >
                      <span className="text-error/30 font-mono">—</span> {problem}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rewrite */}
              <div className="bg-surface-container-lowest rounded-[12px] p-7 ring-1 ring-[rgba(229,226,218,0.4)] shadow-premium border-l-2 border-primary">
                <div className="flex items-center gap-2 text-primary font-bold mb-5 text-[0.875rem] uppercase tracking-wider font-mono">
                  <CheckCircle2 className="w-4 h-4" /> Executive Rewrite
                </div>
                <div className="bg-surface-2 rounded-[8px] p-5 text-[0.9375rem] text-on-background font-mono whitespace-pre-wrap leading-[1.8]">
                  {result?.improved_post}
                </div>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="bg-zinc-950 rounded-2xl p-10 text-center text-white relative overflow-hidden shadow-premium">
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(500px 220px at 80% 0%, rgba(0,74,198,0.5), transparent 65%)",
                }}
              />
              <BarChart3 className="absolute -top-6 -right-6 w-48 h-48 text-white/[0.04] pointer-events-none" />
              <div className="relative z-10 max-w-xl mx-auto">
                <p className="kicker !text-white/40 mb-3">Keep going</p>
                <h3 className="text-2xl font-serif mb-3">Scale your editorial precision.</h3>
                <p className="text-white/60 font-medium text-[0.95rem] mb-8 leading-relaxed">
                  Every post you write will be automatically optimized to perfectly match your brand
                  voice, career goals, and target audience.
                </p>
                <a
                  href="/dashboard/create"
                  className="bg-white/[0.08] hover:bg-white/[0.16] ring-1 ring-white/20 text-white px-7 py-3 rounded-lg font-bold text-[0.875rem] uppercase tracking-wider transition-all inline-flex items-center gap-2"
                >
                  Create optimized post <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
