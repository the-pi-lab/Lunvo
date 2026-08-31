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
} from "lucide-react";
import Link from "next/link";
import { getUsage, getLastER, getLastHook } from "@/lib/localStore";
import { ModeSwitcher } from "@/components/workflow/ModeSwitcher";

interface UserData {
  full_name: string;
  plan: string;
  streak_count: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [liveER, setLiveER] = useState<number | null>(null);
  const [liveHook, setLiveHook] = useState<number | null>(null);

  useEffect(() => {
    const usage = getUsage();
    setUserData({
      full_name: "Local Commander",
      plan: "studio",
      streak_count: usage.generate + usage.analyze,
    });
    setLiveER(getLastER());
    setLiveHook(getLastHook());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-surface-container-high rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-surface-container-high rounded-2xl" />
          <div className="h-64 bg-surface-container-high rounded-2xl" />
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-outline-variant/40">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
            {greeting}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-background tracking-tight leading-tight">
            {userData?.full_name.split(" ")[0]},<br />
            <span className="text-on-surface-variant/70 font-medium">
              welcome to Mission Control.
            </span>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <ModeSwitcher />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 font-mono">
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* Hero Highlight Card: n8n-Style Workflow Studio */}
      <Link
        href="/dashboard/workflow"
        className="group block relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-10 text-white shadow-xl hover:shadow-2xl hover:scale-[1.005] transition-all duration-300"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW: LUNVO 2.0 Node Builder</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Autonomous n8n-Style Workflow Canvas
            </h2>
            <p className="text-blue-100/80 text-sm leading-relaxed mb-4">
              Visually assemble custom pipelines, chain condition gates (score &gt;= 85), connect
              RSS triggers, and schedule outbound webhooks with 12 prebuilt templates.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-white text-blue-900 font-bold text-xs uppercase tracking-wider shadow-lg group-hover:bg-blue-50 flex items-center gap-2 transition-colors">
              <GitFork className="w-4 h-4" />
              <span>Open Node Canvas</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>

      {/* Bento Grid: Core Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* 1. Simple Content Factory */}
        <Link
          href="/dashboard/create"
          className="group block glass glow-hover rounded-3xl p-8 !border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(37,99,235,0.08)] hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <PenTool className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-on-background mb-3">Simple Studio</h2>
            <p className="text-on-surface-variant mb-8 max-w-sm leading-relaxed text-sm">
              Deploy our 3-Agent Neural Pipeline (Scout → Writer → Critic) to generate high-reach
              LinkedIn posts instantly from a single prompt.
            </p>
            <div className="flex items-center text-sm font-bold text-blue-600 uppercase tracking-widest group-hover:gap-3 transition-all gap-2">
              Launch Studio <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* 2. Voice DNA */}
        <Link
          href="/dashboard/studio"
          className="group block glass glow-hover rounded-3xl p-8 !border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.08)] hover:border-emerald-200 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Settings2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-on-background mb-3">Voice DNA Tuner</h2>
            <p className="text-on-surface-variant mb-8 max-w-sm leading-relaxed text-sm">
              Calibrate your unique writing style. The system automatically injects your tone into
              every generation to ensure authenticity.
            </p>
            <div className="flex items-center text-sm font-bold text-emerald-600 uppercase tracking-widest group-hover:gap-3 transition-all gap-2">
              Configure DNA <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* 3. Engagement Analyzer */}
        <Link
          href="/dashboard/analyze"
          className="group block glass glow-hover rounded-3xl p-8 !border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(139,92,246,0.08)] hover:border-indigo-200 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <BarChart2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-on-background mb-3">Engagement Predictor</h2>
            <p className="text-on-surface-variant mb-8 max-w-sm leading-relaxed text-sm">
              Audit your existing drafts against our AI scoring matrix. Identify hook weaknesses and
              structural flaws before you publish.
            </p>
            <div className="flex items-center text-sm font-bold text-indigo-600 uppercase tracking-widest group-hover:gap-3 transition-all gap-2">
              Run Analysis <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* 4. Repurposer Studio */}
        <Link
          href="/dashboard/repurpose"
          className="group block glass glow-hover rounded-3xl p-8 !border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(245,158,11,0.08)] hover:border-amber-200 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Repeat className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-on-background mb-3">Repurposer Studio</h2>
            <p className="text-on-surface-variant mb-8 max-w-sm leading-relaxed text-sm">
              Turn YouTube videos, podcast transcripts, and blog posts into viral LinkedIn threads
              with a single click.
            </p>
            <div className="flex items-center text-sm font-bold text-amber-600 uppercase tracking-widest group-hover:gap-3 transition-all gap-2">
              Launch Studio <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">
              Streak
            </p>
            <p className="text-xl font-bold text-on-background">{userData?.streak_count} Days</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">
              Predicted ER
            </p>
            <p className="text-xl font-bold text-on-background">
              {liveER !== null ? `${liveER.toFixed(1)}%` : "—"}
              {liveHook !== null && (
                <span className="ml-2 text-xs font-medium text-on-surface-variant/60">
                  Hook {liveHook}/10
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
