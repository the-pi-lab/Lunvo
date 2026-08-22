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
import { createClient } from "@/lib/supabase/client";
import { isLocalMode } from "@/lib/localMode";
import { getApiHeaders } from "@/lib/apiHelper";

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
}

export default function AnalyzePostPage() {
  const [view, setView] = useState<"input" | "loading" | "results">("input");
  const [postContent, setPostContent] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const supabase = createClient();
  const searchParams =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  useEffect(() => {
    // Check for content in URL
    const content = searchParams?.get("content");
    if (content) {
      setPostContent(decodeURIComponent(content));
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (postContent.trim().length < 20) return;
    setView("loading");

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

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze post");

      setResult(data);
      setView("results");
    } catch (error: any) {
      console.error("Analysis failed:", error);
      alert("An error occurred during analysis.");
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
              <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-2">
                Analysis Engine
              </p>
              <h1 className="text-4xl font-serif text-on-background mb-2">Audit your post.</h1>
              <p className="text-[0.95rem] font-medium text-on-surface-variant">
                Paste any LinkedIn post. Get a full editorial breakdown in seconds.
              </p>
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
                  className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container hover:shadow-premium disabled:opacity-40 disabled:pointer-events-none text-on-primary px-7 py-3 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  Run Analysis <ArrowRight className="w-4 h-4" />
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
              <div>
                <button
                  onClick={() => setView("input")}
                  className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60 hover:text-primary transition-colors font-mono mb-4"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> New Analysis
                </button>
                <h2 className="text-4xl font-serif text-on-background">Editorial Report</h2>
              </div>

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
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-[12px] p-10 text-center text-on-primary relative overflow-hidden shadow-premium">
              <div className="absolute -top-4 -right-4 opacity-[0.06] pointer-events-none">
                <BarChart3 className="w-48 h-48 text-white" />
              </div>
              <div className="relative z-10 max-w-xl mx-auto">
                <h3 className="text-2xl font-serif mb-3">Scale your editorial precision.</h3>
                <p className="text-on-primary/80 font-medium text-[0.95rem] mb-8 leading-relaxed">
                  Every post you write will be automatically optimized to perfectly match your brand
                  voice, career goals, and target audience.
                </p>
                <a
                  href="/dashboard/create"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-on-primary px-7 py-3 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] transition-all inline-flex items-center gap-2"
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
