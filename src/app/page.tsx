"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Users,
  Zap,
  BookOpen,
  Layers,
  ShieldCheck,
  Github,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import PlaygroundHero from "@/components/landing/PlaygroundHero";

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

interface RatingItem {
  display_name: string;
  rating: number;
  opinion: string;
  created_at: string;
}

const FEATURES = [
  {
    icon: Zap,
    label: "Hook Score",
    desc: "First line rated against viral patterns the moment you type.",
  },
  {
    icon: BarChart3,
    label: "Instant Rewrite",
    desc: "AI rewrites weak posts into publish-ready drafts in seconds.",
  },
  {
    icon: BookOpen,
    label: "Editorial Report",
    desc: "Actionable breakdown across 4 signal categories.",
  },
  {
    icon: Users,
    label: "Voice DNA",
    desc: "4 sliders clone your tone - every post sounds like YOU.",
  },
  {
    icon: Layers,
    label: "Carousel Generator",
    desc: "1080x1350 LinkedIn carousels, 5 templates, free forever.",
  },
  {
    icon: ShieldCheck,
    label: "Humanizer",
    desc: "Anti-AI-slop engine. Passes AI detectors 90%+ human.",
  },
];

const COMPARISON = [
  { feature: "Price", taplio: "$39-$199/mo", supergrow: "$19-$69/mo", lunvo: "$0 - MIT" },
  { feature: "AI Router", taplio: "Locked GPT", supergrow: "Locked", lunvo: "BYOK + Ollama" },
  { feature: "Voice Clone", taplio: "Generic prompt", supergrow: "Template", lunvo: "Voice DNA" },
  { feature: "Pipeline", taplio: "Single prompt", supergrow: "Single", lunvo: "3-Agent" },
  { feature: "Ban Risk", taplio: "Unofficial API", supergrow: "Medium", lunvo: "Zero - clipboard" },
  { feature: "Self-Host", taplio: "No", supergrow: "No", lunvo: "Docker in 30s" },
];

export default function LandingPage() {
  const [view, setView] = useState<"input" | "loading" | "results">("input");
  const [postContent, setPostContent] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [ratingsFeed, setRatingsFeed] = useState<RatingItem[]>([]);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setIsLoggedIn(true);
        setAuthChecked(true);
      });
    });
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    if (isLoggedIn) {
      setShowSignupGate(false);
      return;
    }

    const hasAnalyzed = localStorage.getItem("linkedin_ai_analyzed");
    if (hasAnalyzed === "true") {
      setShowSignupGate(true);
    }
  }, [isLoggedIn, authChecked]);

  useEffect(() => {
    let isMounted = true;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/ratings", { cache: "force-cache" });
        if (!response.ok || !isMounted) return;

        const payload = await response.json();
        if (isMounted) {
          setRatingsFeed(payload.ratings || []);
        }
      } catch (error) {
        console.error("Failed to load ratings feed:", error);
      }
    }, 250);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  const handleAnalyze = async () => {
    if (postContent.trim().length < 20) return;

    if (!isLoggedIn && authChecked) {
      const hasAnalyzed = localStorage.getItem("linkedin_ai_analyzed");
      if (hasAnalyzed === "true") {
        setShowSignupGate(true);
        return;
      }
    }

    setView("loading");
    setAnalyzeError(null);

    try {
      const endpoint = isLoggedIn ? "/api/analyze" : "/api/analyze-public";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: postContent }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze post");

      setResult(data);

      if (!isLoggedIn) {
        localStorage.setItem("linkedin_ai_analyzed", "true");
        setShowSignupGate(true);
      }

      setView("results");
    } catch (error: unknown) {
      console.error("Analysis failed:", error);
      const message = error instanceof Error ? error.message : "Something went wrong. Try again.";
      setAnalyzeError(message);
      setView("input");
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-background font-sans selection:bg-primary/10">
      {/* INPUT STATE */}
      {view === "input" && (
        <div key="input">
          <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-[rgba(229,226,218,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-3 max-w-6xl mx-auto">
              <div className="inline-flex items-center gap-2">
                <img
                  src="/brand/lunvo-logo.png"
                  alt="LUNVO logo"
                  className="w-4 h-4 rounded-[3px] object-contain"
                />
                <span className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-on-background">
                  LUNVO
                </span>
              </div>
              <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-4">
                <a
                  href="https://github.com/the-pi-lab/Lunvo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 text-[0.8125rem] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors font-mono"
                >
                  <Github className="w-4 h-4" /> Star
                </a>
                <Link
                  href="/login"
                  className="text-[0.8125rem] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors font-mono"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary text-[0.8125rem] font-bold rounded-[8px] uppercase tracking-wider shadow-md hover:shadow-premium transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </nav>

          {/* Hero */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10">
            <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-primary/80 mb-5">
                LUNVO • Open Source LinkedIn OS - Zero-Ban. BYOK. Local-First.
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-on-background leading-[1.05] mb-6">
                Is your post
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                  scroll-worthy?
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl font-medium text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                Paste your draft. Watch live scores update as you type. Then get a full AI editorial
                rewrite - free.
              </p>
            </div>

            {showSignupGate && !isLoggedIn ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-7 h-7 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-serif font-bold text-on-background mb-3">
                  You&apos;ve used your free analysis
                </h2>
                <p className="text-on-surface-variant text-base mb-8 max-w-sm mx-auto">
                  Sign up free to analyze unlimited posts, generate content, and track your LinkedIn
                  growth.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/signup"
                    className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-medium px-8 py-3 rounded-xl text-base transition-colors hover:shadow-premium"
                  >
                    Create free account →
                  </a>
                  <a
                    href="/login"
                    className="bg-surface-container-lowest border border-[rgba(229,226,218,0.5)] hover:bg-surface-container-low text-on-background font-medium px-8 py-3 rounded-xl text-base transition-colors"
                  >
                    Log in
                  </a>
                </div>

                <div className="mt-10 bg-surface-container-low border border-[rgba(229,226,218,0.4)] rounded-[12px] p-6 max-w-sm mx-auto text-left">
                  <p className="text-sm font-semibold text-on-background mb-3">
                    Free account includes:
                  </p>
                  <ul className="space-y-2">
                    {[
                      "2 post analyses per day",
                      "2 post generations per day",
                      "Writing streak tracker",
                      "30-day LinkedIn learning course",
                      "Saved drafts",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-on-surface-variant"
                      >
                        <svg
                          className="w-4 h-4 text-secondary shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs text-on-surface-variant/50 mt-6">
                  No credit card required. Free forever.
                </p>
              </div>
            ) : (
              <>
                <PlaygroundHero
                  value={postContent}
                  onChange={setPostContent}
                  onSubmit={handleAnalyze}
                  busy={false}
                />
                {analyzeError && (
                  <div className="max-w-6xl mx-auto mt-4">
                    <div className="flex items-center gap-3 p-4 rounded-[8px] bg-error/10 border border-error/20">
                      <AlertCircle className="w-5 h-5 text-error shrink-0" />
                      <p className="text-sm text-error">{analyzeError}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {ratingsFeed.length > 0 && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
              <div className="overflow-hidden rounded-[12px] border border-[rgba(229,226,218,0.5)] bg-surface-container-lowest p-3 shadow-premium">
                <div className="rating-track flex w-max items-center gap-3">
                  {[...ratingsFeed, ...ratingsFeed].map((item, idx) => (
                    <div
                      key={`${item.display_name}-${item.created_at}-${idx}`}
                      className="min-w-[280px] rounded-[8px] border border-[rgba(229,226,218,0.5)] bg-surface-container-lowest px-3 py-2"
                    >
                      <p className="text-[0.75rem] font-semibold text-on-background">
                        {item.display_name} rated {"★".repeat(item.rating)}
                      </p>
                      <p className="text-[0.72rem] text-on-surface-variant line-clamp-1">
                        {item.opinion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feature Strip */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="p-4 sm:p-6 bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium hover:ring-primary/15 transition-all"
                >
                  <div className="w-9 h-9 bg-primary/5 rounded-[8px] flex items-center justify-center mb-4">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="text-[0.875rem] font-bold text-on-background mb-1">{label}</div>
                  <div className="text-[0.8125rem] font-medium text-on-surface-variant leading-relaxed">
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif text-on-background mb-2">
                Why pay $199/mo?
              </h2>
              <p className="text-sm font-medium text-on-surface-variant">
                Same workflow as paid tools - open source, self-hosted, yours.
              </p>
            </div>
            <div className="overflow-x-auto bg-surface-container-lowest rounded-[16px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-[rgba(229,226,218,0.4)]">
                    <th className="text-left px-4 sm:px-6 py-4 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono">
                      Feature
                    </th>
                    <th className="text-left px-4 py-4 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono">
                      Taplio
                    </th>
                    <th className="text-left px-4 py-4 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono">
                      Supergrow
                    </th>
                    <th className="text-left px-4 sm:px-6 py-4 text-[0.625rem] font-bold uppercase tracking-widest text-primary font-mono">
                      LUNVO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-[rgba(229,226,218,0.25)] last:border-0"
                    >
                      <td className="px-4 sm:px-6 py-3.5 font-bold text-on-background">
                        {row.feature}
                      </td>
                      <td className="px-4 py-3.5 text-on-surface-variant">{row.taplio}</td>
                      <td className="px-4 py-3.5 text-on-surface-variant">{row.supergrow}</td>
                      <td className="px-4 sm:px-6 py-3.5 font-bold text-primary">{row.lunvo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {view === "loading" && (
        <div key="loading" className="flex flex-col items-center justify-center min-h-screen p-6">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-serif text-on-background mb-2">
            Running editorial analysis…
          </h2>
          <p className="text-[0.875rem] font-medium text-on-surface-variant mb-8">
            Cross-referencing viral post patterns with AI
          </p>
          <div className="space-y-3 w-full max-w-xs">
            <div className="h-2 bg-surface-container rounded-full animate-pulse w-4/5" />
            <div className="h-2 bg-surface-container rounded-full animate-pulse w-full" />
            <div className="h-2 bg-surface-container rounded-full animate-pulse w-3/5" />
          </div>
        </div>
      )}

      {/* RESULTS STATE */}
      {view === "results" && (
        <div key="results" className="max-w-5xl mx-auto py-14 px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
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

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-surface-container-lowest rounded-[12px] p-7 ring-1 ring-[rgba(229,226,218,0.4)] shadow-premium border-l-2 border-error">
              <div className="flex items-center gap-2 text-error font-bold mb-5 text-[0.875rem] uppercase tracking-wider font-mono">
                <AlertCircle className="w-4 h-4" /> Identify &amp; Eliminate
              </div>
              <ul className="space-y-4">
                {result?.top_problems.map((problem, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-on-background font-medium text-[0.9375rem] leading-relaxed"
                  >
                    <span className="text-error/30 font-mono">—</span> {problem}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-container-lowest rounded-[12px] p-7 ring-1 ring-[rgba(229,226,218,0.4)] shadow-premium border-l-2 border-primary">
              <div className="flex items-center gap-2 text-primary font-bold mb-5 text-[0.875rem] uppercase tracking-wider font-mono">
                <CheckCircle2 className="w-4 h-4" /> Executive Rewrite
              </div>
              <div className="bg-surface-2 rounded-[8px] p-5 text-[0.9375rem] text-on-background font-mono whitespace-pre-wrap leading-[1.8]">
                {result?.improved_post}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-container rounded-[12px] p-12 text-center text-on-primary relative overflow-hidden shadow-premium">
            <div className="absolute -top-6 -right-6 opacity-[0.06] pointer-events-none">
              <BarChart3 className="w-56 h-56 text-white" />
            </div>
            <div className="relative z-10 max-w-xl mx-auto">
              <h3 className="text-3xl font-serif mb-4">Scale your editorial precision.</h3>
              <p className="text-on-primary/80 font-medium text-[0.95rem] mb-10 leading-relaxed">
                Join the platform. Every post you write will be automatically optimized to match
                your brand voice, career goals, and target audience.
              </p>
              <Link
                href="/signup"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-on-primary px-8 py-3.5 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] transition-all inline-flex items-center gap-2"
              >
                Create your free profile <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden border-y border-[rgba(229,226,218,0.4)] bg-surface-container-lowest py-4">
        <div className="credit-track flex w-max items-center gap-10 px-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <p
              key={idx}
              className="text-[1.125rem] md:text-[1.75rem] font-serif font-bold uppercase tracking-[0.08em] text-on-background/85 whitespace-nowrap"
            >
              Built with love by VINAYAK MAHAVAR
            </p>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container py-16 sm:py-20 border-t border-[rgba(229,226,218,0.3)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="inline-flex items-center gap-2 mb-6">
              <img
                src="/brand/lunvo-logo.png"
                alt="LUNVO logo"
                className="w-5 h-5 rounded-[4px] object-contain"
              />
              <span className="font-serif italic text-2xl text-on-background">LUNVO</span>
            </div>
            <p className="text-[0.9375rem] text-on-surface-variant max-w-sm leading-relaxed mb-8">
              Smarter LinkedIn content. Zero guesswork.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/the-pi-lab/Lunvo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors ring-1 ring-[rgba(229,226,218,0.4)]"
              >
                <span className="sr-only">GitHub</span>
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/the-%CF%80-lab/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors ring-1 ring-[rgba(229,226,218,0.4)]"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-6">
              Product
            </h4>
            <ul className="space-y-4 text-[0.875rem] font-medium text-on-surface-variant">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-primary transition-colors">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-primary transition-colors">
                  Persona Setup
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-6">
              Help &amp; Legal
            </h4>
            <ul className="space-y-4 text-[0.875rem] font-medium text-on-surface-variant">
              <li>
                <Link href="/support" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:mahavarvinayak@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  mahavarvinayak@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.thepilab.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  THE Π LAB Website
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-[rgba(229,226,218,0.3)] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[0.6875rem] text-on-surface-variant/40 font-mono uppercase tracking-widest">
            © 2026 THE Π LAB — MERCHANT: MAHAVAR VINAYAK DILIPKUMAR
          </p>
          <div className="flex gap-6 text-[0.6875rem] font-mono font-bold uppercase tracking-tighter text-on-surface-variant/30">
            <span>v2.0.0-stable</span>
            <span>MIT Licensed</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .rating-track {
          animation: rating-scroll 32s linear infinite;
        }

        .credit-track {
          animation: credit-scroll 18s linear infinite;
        }

        @keyframes rating-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes credit-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </main>
  );
}
