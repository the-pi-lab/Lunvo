"use client";

import { useEffect, useState } from "react";
import {
  PenTool,
  BarChart2,
  Repeat,
  Settings2,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  GitFork,
  Sparkles,
  Bot,
  Share2,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  Flame,
  ArrowUpRight,
  Sliders,
  Send,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { getUsage, getLastER, getLastHook } from "@/lib/localStore";
import { ModeSwitcher } from "@/components/workflow/ModeSwitcher";
import { getActiveAIProfile } from "@/lib/apiHelper";
import { getVoiceDNA } from "@/lib/voice-dna/memory";

interface UserData {
  full_name: string;
  plan: string;
  streak_count: number;
}

const QUICK_PROMPTS = [
  {
    title: "Contrarian Tech Take",
    tag: "High Virality",
    prompt: "Why 90% of engineering teams over-engineer their AI pipelines in 2026.",
    color: "from-blue-500/10 to-indigo-500/10 border-blue-200/60 hover:border-blue-400",
  },
  {
    title: "3 Architecture Rules",
    tag: "Educational",
    prompt: "3 rules for building local-first Next.js web applications that scale.",
    color: "from-purple-500/10 to-pink-500/10 border-purple-200/60 hover:border-purple-400",
  },
  {
    title: "Zero-to-One Growth",
    tag: "Framework",
    prompt: "How we went from 0 to 1,000 GitHub stars without spending $1 on marketing.",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-200/60 hover:border-emerald-400",
  },
  {
    title: "Weekly News Breakdown",
    tag: "Trending",
    prompt: "The biggest shift in open-source AI models this week and what it means.",
    color: "from-amber-500/10 to-orange-500/10 border-amber-200/60 hover:border-amber-400",
  },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [liveER, setLiveER] = useState<number | null>(null);
  const [liveHook, setLiveHook] = useState<number | null>(null);
  const [activeModel, setActiveModel] = useState<string>("Groq Llama 3.3 70B");
  const [voiceDnaScore, setVoiceDnaScore] = useState<number>(92);

  useEffect(() => {
    const usage = getUsage();
    const profile = getActiveAIProfile();
    const voiceDna = getVoiceDNA();

    setUserData({
      full_name: "Local Commander",
      plan: "studio",
      streak_count: Math.max(1, usage.generate + usage.analyze),
    });
    setLiveER(getLastER());
    setLiveHook(getLastHook());

    if (profile) {
      setActiveModel(`${profile.provider.toUpperCase()} (${profile.model || "Default"})`);
    }
    if (voiceDna && voiceDna.tone && voiceDna.tone.length > 0) {
      setVoiceDnaScore(Math.min(98, 85 + voiceDna.tone.length * 3));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-surface-container-high rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-surface-container-high rounded-3xl" />
          <div className="h-64 bg-surface-container-high rounded-3xl" />
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. Header Section with Mission Status */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[0.6875rem] font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-3 h-3" /> LUNVO 2.0 Autonomous OS
            </span>
            <span className="text-xs text-on-surface-variant/60 font-medium">• {greeting}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-background tracking-tight leading-tight">
            {userData?.full_name.split(" ")[0]},<br />
            <span className="text-on-surface-variant/70 font-medium">
              your LinkedIn content factory is ready.
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ModeSwitcher />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">
              {activeModel}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Hero Highlight: Visual n8n Workflow Studio Card */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] p-8 sm:p-10 text-white shadow-2xl border border-white/10 group transition-all duration-300 hover:shadow-indigo-500/10">
        {/* Glow ambient meshes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-400/25 transition-all" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <GitFork className="w-3.5 h-3.5" />
              <span>Flagship Feature • Visual Node Canvas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
              Autonomous n8n-Style Workflow Builder
            </h2>
            <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed">
              Design automated multi-step content machines. Combine <b>RSS Triggers</b>,{" "}
              <b>Scout ➔ Writer ➔ Critic</b> neural chains, <b>Quality Gatekeepers</b> (Score &gt;=
              85), and <b>Zapier / Make Webhooks</b> with 12 production prebuilt templates.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-blue-200/90 font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>12 Prebuilt Flows</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-200/90 font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>15 Node Types</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-200/90 font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Zero-Ban Safety</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              href="/dashboard/workflow"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <GitFork className="w-4 h-4 text-blue-600" />
              <span>Launch Node Canvas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/distribution"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/15 backdrop-blur-md flex items-center justify-center gap-2 transition-colors"
            >
              <Clock className="w-4 h-4 text-blue-300" />
              <span>View Scheduled Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Core Bento Grid (4 Core Pillars) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-mono">
            Core Command Modules
          </h3>
          <span className="text-xs text-on-surface-variant/60">4 Autonomous Pillars</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Simple 3-Agent Studio */}
          <Link
            href="/dashboard/create"
            className="group relative overflow-hidden rounded-[24px] bg-surface-container-lowest p-8 border border-outline-variant/50 shadow-sm hover:shadow-xl hover:border-blue-300/80 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-xs">
                  <PenTool className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                  3-Agent Chain
                </span>
              </div>
              <h4 className="text-xl font-bold text-on-background mb-2">Neural Content Studio</h4>
              <p className="text-on-surface-variant/80 text-sm leading-relaxed mb-6">
                Scout extracts 3 contrarian hooks ➔ Writer streams full draft with Voice DNA ➔
                Critic assigns 100-point virality audit in seconds.
              </p>
              <div className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest group-hover:gap-2.5 transition-all gap-1.5">
                <span>Open Neural Studio</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>

          {/* Pillar 2: 24/7 Telegram Companion Bot */}
          <Link
            href="/dashboard/telegram"
            className="group relative overflow-hidden rounded-[24px] bg-surface-container-lowest p-8 border border-outline-variant/50 shadow-sm hover:shadow-xl hover:border-sky-300/80 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 bg-sky-500/10 text-sky-600 rounded-2xl flex items-center justify-center shadow-xs">
                  <Send className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-mono">
                  Mobile Remote
                </span>
              </div>
              <h4 className="text-xl font-bold text-on-background mb-2">
                24/7 Telegram Bot Remote
              </h4>
              <p className="text-on-surface-variant/80 text-sm leading-relaxed mb-6">
                Control your content engine from your smartphone. Use{" "}
                <code className="text-xs bg-surface-container px-1 py-0.5 rounded font-mono">
                  /idea
                </code>
                ,{" "}
                <code className="text-xs bg-surface-container px-1 py-0.5 rounded font-mono">
                  /approve
                </code>
                , and{" "}
                <code className="text-xs bg-surface-container px-1 py-0.5 rounded font-mono">
                  /humanize
                </code>{" "}
                on the go.
              </p>
              <div className="flex items-center text-xs font-bold text-sky-600 uppercase tracking-widest group-hover:gap-2.5 transition-all gap-1.5">
                <span>Configure Telegram Bot</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>

          {/* Pillar 3: Voice DNA Tuner */}
          <Link
            href="/dashboard/studio"
            className="group relative overflow-hidden rounded-[24px] bg-surface-container-lowest p-8 border border-outline-variant/50 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center shadow-xs">
                  <Sliders className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono">
                  {voiceDnaScore}% Human Target
                </span>
              </div>
              <h4 className="text-xl font-bold text-on-background mb-2">Voice DNA Tone Ingest</h4>
              <p className="text-on-surface-variant/80 text-sm leading-relaxed mb-6">
                Calibrate your authentic writing style. Auto-extract sentence rhythm, vocabulary,
                and banned cliché patterns to ensure zero AI fluff.
              </p>
              <div className="flex items-center text-xs font-bold text-emerald-600 uppercase tracking-widest group-hover:gap-2.5 transition-all gap-1.5">
                <span>Tune Writing DNA</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>

          {/* Pillar 4: Headless MCP Server Suite */}
          <Link
            href="/dashboard/mcp"
            className="group relative overflow-hidden rounded-[24px] bg-surface-container-lowest p-8 border border-outline-variant/50 shadow-sm hover:shadow-xl hover:border-purple-300/80 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center shadow-xs">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-mono">
                  8 Tools Live
                </span>
              </div>
              <h4 className="text-xl font-bold text-on-background mb-2">Headless MCP Server</h4>
              <p className="text-on-surface-variant/80 text-sm leading-relaxed mb-6">
                Connect LUNVO directly to Cursor IDE, Claude Desktop, or Antigravity via{" "}
                <code className="text-xs bg-surface-container px-1 py-0.5 rounded font-mono">
                  npx lunvo-mcp
                </code>{" "}
                to run automated workflows in the background.
              </p>
              <div className="flex items-center text-xs font-bold text-purple-600 uppercase tracking-widest group-hover:gap-2.5 transition-all gap-1.5">
                <span>Get MCP Config</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Quick Prompt Ideas Launchpad */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-mono">
              Quick Launch Prompts
            </h3>
          </div>
          <span className="text-xs text-on-surface-variant/60">Click any idea to draft</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_PROMPTS.map((item, idx) => (
            <Link
              key={idx}
              href={`/dashboard/create?topic=${encodeURIComponent(item.prompt)}`}
              className={`block p-5 rounded-2xl bg-gradient-to-br ${item.color} border transition-all duration-200 hover:-translate-y-1 hover:shadow-md bg-surface-container-lowest`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-container/70 text-on-surface-variant font-mono">
                  {item.tag}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant/60" />
              </div>
              <h5 className="text-xs font-bold text-on-background mb-1.5">{item.title}</h5>
              <p className="text-[11px] text-on-surface-variant/80 leading-relaxed line-clamp-2">
                {item.prompt}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. Live Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest font-mono">
              Activity Streak
            </p>
            <p className="text-xl font-extrabold text-on-background">
              {userData?.streak_count} Days
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest font-mono">
              Predicted ER
            </p>
            <p className="text-xl font-extrabold text-on-background">
              {liveER !== null ? `${liveER.toFixed(1)}%` : "4.2%"}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest font-mono">
              Hook Strength
            </p>
            <p className="text-xl font-extrabold text-on-background">
              {liveHook !== null ? `${liveHook}/10` : "9.2/10"}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest font-mono">
              Zero-Ban Guard
            </p>
            <p className="text-xl font-extrabold text-emerald-600">100% Safe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
