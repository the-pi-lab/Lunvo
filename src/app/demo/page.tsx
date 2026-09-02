import React from "react";
import { ProductDemoPlayer } from "@/components/showcase/ProductDemoPlayer";
import Link from "next/link";
import { ArrowLeft, Sparkles, Star, Github } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LUNVO 2.0 — Product Demo Showcase Video",
  description:
    "Watch the 95-second cinematic product demo of LUNVO — Autonomous LinkedIn Growth Engine & Multi-Agent Studio.",
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#05050A] text-white flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background Ambient Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/20 via-pink-500/10 to-transparent blur-[140px]" />
      </div>

      {/* Top Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between z-20 py-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/the-pi-lab/Lunvo"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full transition-all"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 px-4 py-1.5 rounded-full transition-all shadow-md shadow-violet-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Studio</span>
          </Link>
        </div>
      </header>

      {/* Hero Headline */}
      <div className="text-center space-y-2 my-6 z-20 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold tracking-wide">
          <Sparkles className="w-3 h-3 text-pink-400" />
          <span>Cinematic Product Tour</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          LUNVO 2.0 in{" "}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            95 Seconds
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Experience the autonomous 3-agent writing pipeline, visual workflow engine, and zero-ban
          distribution.
        </p>
      </div>

      {/* Main Interactive Demo Player */}
      <div className="w-full max-w-5xl z-20">
        <ProductDemoPlayer />
      </div>

      {/* Footer Features Grid */}
      <footer className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 z-20">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-1">
          <div className="text-xs font-bold text-white">⚡ 3-Agent Storyteller</div>
          <div className="text-[11px] text-zinc-400">
            Scout hooks, Writer expansion & Critic viral scoring.
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-1">
          <div className="text-xs font-bold text-white">🔄 Visual Node Workflows</div>
          <div className="text-[11px] text-zinc-400">
            n8n-style graphs with real-time pipeline execution.
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-1">
          <div className="text-xs font-bold text-white">🔒 100% Local-First</div>
          <div className="text-[11px] text-zinc-400">
            Zero vendor lock-in. BYOK models. Zero data collection.
          </div>
        </div>
      </footer>
    </main>
  );
}
