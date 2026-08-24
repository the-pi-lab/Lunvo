"use client";

import { useMemo } from "react";
import { ArrowRight, Loader2, Sparkles, Zap } from "lucide-react";
import { analyzeLocally, type LocalScore } from "@/lib/analysis/localHeuristics";

function scoreColor(score: number): string {
  if (score <= 4) return "text-error";
  if (score <= 6) return "text-tertiary";
  return "text-secondary";
}

function barColor(score: number): string {
  if (score <= 4) return "bg-error";
  if (score <= 6) return "bg-tertiary";
  return "bg-secondary";
}

interface PlaygroundHeroProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  busy: boolean;
}

const SCORE_META: Array<{
  key: "hook" | "readability" | "engagement" | "structure";
  title: string;
}> = [
  { key: "hook", title: "Hook" },
  { key: "readability", title: "Readability" },
  { key: "engagement", title: "Engagement" },
  { key: "structure", title: "Structure" },
];

export default function PlaygroundHero({ value, onChange, onSubmit, busy }: PlaygroundHeroProps) {
  const live = useMemo(() => analyzeLocally(value), [value]);
  const disabled = value.trim().length < 20 || busy;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4 sm:gap-5 items-stretch text-left">
      {/* Left: editor */}
      <div className="glass rounded-[16px] !border-transparent focus-within:ring-primary/30 transition-all overflow-hidden">
        <textarea
          placeholder={
            "Start writing or paste your post here...\n\nLive score updates as you type."
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={3000}
          className="w-full min-h-[260px] sm:min-h-[320px] bg-transparent border-none focus:ring-0 text-[0.95rem] font-mono resize-none p-4 sm:p-6 leading-relaxed text-on-background placeholder:text-on-surface-variant/30 outline-none"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-t border-[rgba(229,226,218,0.4)]">
          <span className="text-[0.625rem] font-bold font-mono text-on-surface-variant/40 uppercase tracking-widest">
            {value.length}/3000 chars
          </span>
          <button
            onClick={onSubmit}
            disabled={disabled}
            className="inline-flex w-full sm:w-auto justify-center items-center gap-2 bg-gradient-to-br from-primary to-primary-container hover:shadow-premium disabled:opacity-40 disabled:pointer-events-none text-on-primary px-7 py-3 rounded-[8px] font-bold text-[0.875rem] transition-all active:scale-[0.98]"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Analyze for Free <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right: live score preview */}
      <div className="flex flex-col gap-3">
        <div className="glass rounded-[16px] !border-transparent p-5 flex items-center justify-between">
          <div>
            <p className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-1">
              Live Score
            </p>
            <div className={`text-4xl font-serif leading-none ${scoreColor(live.overall_score)}`}>
              {live.overall_score}
              <span className="text-lg text-on-surface-variant/30">/10</span>
            </div>
          </div>
          <Zap
            className={`w-8 h-8 ${live.overall_score >= 7 ? "text-secondary" : "text-on-surface-variant/20"} transition-colors`}
          />
        </div>

        <div className="glass rounded-[16px] !border-transparent p-5 space-y-4 flex-1">
          <p className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono">
            Instant Signals — updates as you type
          </p>
          {SCORE_META.map(({ key, title }) => {
            const s: LocalScore = live.scores[key];
            return (
              <div key={key}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono">
                    {title}
                  </span>
                  <span className={`text-sm font-serif font-bold ${scoreColor(s.score)}`}>
                    {s.score}
                    <span className="text-on-surface-variant/30">/10</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor(s.score)}`}
                    style={{ width: `${(s.score / 10) * 100}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[0.75rem] font-medium text-on-surface-variant leading-snug line-clamp-2">
                  {s.explanation}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[0.6875rem] font-mono uppercase tracking-widest text-on-surface-variant/40">
          100% local preview — zero API cost
        </p>
      </div>
    </div>
  );
}
