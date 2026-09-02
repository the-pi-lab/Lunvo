"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Layers,
  Send,
  CheckCircle2,
  Volume2,
  VolumeX,
  Maximize2,
  ArrowRight,
  Shield,
  Bot,
  Share2,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Chapter {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number;
}

const CHAPTERS: Chapter[] = [
  { id: "intro", title: "01. Intro & Hook", startTime: 0, endTime: 14 },
  { id: "studio", title: "02. 3-Agent Studio", startTime: 14, endTime: 36 },
  { id: "workflow", title: "03. Visual Workflows", startTime: 36, endTime: 56 },
  { id: "repurpose", title: "04. Repurpose & Carousels", startTime: 56, endTime: 72 },
  { id: "autopilot", title: "05. 24/7 Webhooks & Bot", startTime: 72, endTime: 86 },
  { id: "outro", title: "06. Open Source CTA", startTime: 86, endTime: 95 },
];

const TOTAL_DURATION = 95; // 95 seconds total runtime

export function ProductDemoPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-tick timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            return 0; // loop
          }
          return Math.min(TOTAL_DURATION, +(prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentChapter =
    CHAPTERS.find((c) => currentTime >= c.startTime && currentTime < c.endTime) ||
    CHAPTERS[CHAPTERS.length - 1]!;

  const progressPercent = (currentTime / TOTAL_DURATION) * 100;

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/9] max-w-5xl mx-auto rounded-3xl overflow-hidden bg-[#07070D] border border-white/10 shadow-[0_25px_60px_-15px_rgba(124,58,237,0.35)] select-none flex flex-col font-sans"
    >
      {/* Top Ambient Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-violet-600/25 via-pink-500/20 to-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-purple-800/20 via-blue-700/15 to-transparent blur-[140px]" />
      </div>

      {/* Top Header Overlay */}
      <div className="absolute top-0 inset-x-0 h-14 px-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 text-white font-bold text-xs shadow-md shadow-violet-500/30">
            L
          </div>
          <span className="font-bold text-sm text-white tracking-wide">LUNVO 2.0</span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Product Showcase
          </span>
        </div>

        {/* Current Active Chapter Tag */}
        <div className="flex items-center gap-2 text-xs font-semibold text-white/80 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span>{currentChapter.title}</span>
        </div>
      </div>

      {/* Main Video Stage Viewport */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden p-6 sm:p-12">
        {/* ACT 1: INTRO & HOOK (0s - 14s) */}
        {currentTime < 14 && (
          <motion.div
            key="act1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full flex flex-col items-center justify-center text-center space-y-6 max-w-2xl"
          >
            {currentTime < 5 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>The Autonomous LinkedIn Growth Engine</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Introduces{" "}
                  <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                    LUNVO AI
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-zinc-400 font-medium">
                  Give your team superpowers to turn raw ideas into viral thought leadership.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="px-6 py-3 rounded-2xl bg-white text-zinc-950 font-black text-2xl sm:text-3xl shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                >
                  9x Better Viral Engagement
                </motion.div>
                <p className="text-sm text-zinc-300">
                  100% Local-First. Zero Subscriptions. Bring Your Own Models.
                </p>

                {/* Animated Cursor Pointer */}
                <motion.div
                  initial={{ x: -100, y: 60, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                  className="flex items-center justify-center gap-2 pt-2"
                >
                  <div className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold shadow-lg flex items-center gap-2">
                    <span>Explore 3-Agent Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ACT 2: 3-AGENT STUDIO (14s - 36s) */}
        {currentTime >= 14 && currentTime < 36 && (
          <motion.div
            key="act2"
            initial={{ opacity: 0, rotateX: 15, scale: 0.88 }}
            animate={{ opacity: 1, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl flex flex-col gap-4"
            style={{ perspective: 1200 }}
          >
            {/* Studio Input Pill Card */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-600/30 flex items-center justify-center text-violet-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Input Topic
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    {currentTime < 20 ? (
                      <span className="border-r-2 border-pink-500 pr-1 animate-pulse">
                        Why simple code beats complex microservices
                      </span>
                    ) : (
                      "Why simple code beats complex microservices in 2026"
                    )}
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>3 Agents Active</span>
              </div>
            </div>

            {/* 3D Main Preview Card with Real-Time Score Rollups */}
            <div className="p-5 rounded-3xl bg-white text-zinc-900 shadow-2xl space-y-4 border border-zinc-200">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-zinc-800">Scout & Writer Pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-violet-100 text-violet-800">
                    Critic: {Math.min(94, Math.round(40 + (currentTime - 14) * 2.5))}/100
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    Human Score: {Math.min(98, Math.round(55 + (currentTime - 14) * 2))}%
                  </span>
                </div>
              </div>

              {/* Generated Post Snippet */}
              <div className="text-xs leading-relaxed text-zinc-700 font-medium space-y-2 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/60">
                <p className="font-bold text-zinc-950">
                  Most engineering teams don&apos;t have a scaling problem. They have a complexity
                  addiction.
                </p>
                <p className="text-[11px] text-zinc-600">
                  We spent 6 months splitting our monolith into 12 microservices. Latency 3x&apos;d.
                  Last week we collapsed it back into a modular monolith. Deploy times dropped from
                  24m to 80s.
                </p>
              </div>

              {/* Score Breakdown Bars */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/50">
                  <div className="text-[10px] font-bold text-zinc-500">Hook Virality</div>
                  <div className="text-xs font-black text-violet-700">
                    {Math.min(96, Math.round(50 + (currentTime - 14) * 2.2))}%
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/50">
                  <div className="text-[10px] font-bold text-zinc-500">Story Depth</div>
                  <div className="text-xs font-black text-blue-700">
                    {Math.min(92, Math.round(45 + (currentTime - 14) * 2.1))}%
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/50">
                  <div className="text-[10px] font-bold text-zinc-500">AI Bypass Score</div>
                  <div className="text-xs font-black text-emerald-700">
                    {Math.min(98, Math.round(60 + (currentTime - 14) * 1.8))}%
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ACT 3: VISUAL WORKFLOW BUILDER (36s - 56s) */}
        {currentTime >= 36 && currentTime < 56 && (
          <motion.div
            key="act3"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-3xl space-y-4"
          >
            {/* Top Bar Header */}
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Autonomous Visual Node Engine</span>
                </h3>
                <p className="text-xs text-zinc-400">n8n-style graphs for multi-agent execution</p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Pipeline Running</span>
              </div>
            </div>

            {/* Connected Node Graph Simulation */}
            <div className="relative p-6 rounded-3xl bg-[#0F0F1A] border border-white/10 shadow-2xl overflow-hidden grid grid-cols-4 gap-3">
              {/* Node 1: Trigger */}
              <motion.div
                animate={{
                  borderColor: currentTime > 38 ? "#8B5CF6" : "rgba(255,255,255,0.1)",
                  boxShadow: currentTime > 38 ? "0 0 20px rgba(139,92,246,0.4)" : "none",
                }}
                className="p-3 rounded-2xl bg-white/5 border text-center space-y-1.5"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-violet-600/30 text-violet-400 flex items-center justify-center text-xs">
                  ⚡
                </div>
                <div className="text-[11px] font-bold text-white">RSS/Idea Trigger</div>
                <div className="text-[9px] text-zinc-400">Auto-detect</div>
              </motion.div>

              {/* Node 2: Scout Agent */}
              <motion.div
                animate={{
                  borderColor: currentTime > 42 ? "#EC4899" : "rgba(255,255,255,0.1)",
                  boxShadow: currentTime > 42 ? "0 0 20px rgba(236,72,153,0.4)" : "none",
                }}
                className="p-3 rounded-2xl bg-white/5 border text-center space-y-1.5"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-pink-600/30 text-pink-400 flex items-center justify-center text-xs">
                  🎯
                </div>
                <div className="text-[11px] font-bold text-white">Scout Agent</div>
                <div className="text-[9px] text-zinc-400">5 Hooks</div>
              </motion.div>

              {/* Node 3: Writer & Critic */}
              <motion.div
                animate={{
                  borderColor: currentTime > 46 ? "#3B82F6" : "rgba(255,255,255,0.1)",
                  boxShadow: currentTime > 46 ? "0 0 20px rgba(59,130,246,0.4)" : "none",
                }}
                className="p-3 rounded-2xl bg-white/5 border text-center space-y-1.5"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs">
                  ✍️
                </div>
                <div className="text-[11px] font-bold text-white">Writer & Critic</div>
                <div className="text-[9px] text-zinc-400">Voice DNA</div>
              </motion.div>

              {/* Node 4: Webhook Dispatch */}
              <motion.div
                animate={{
                  borderColor: currentTime > 50 ? "#10B981" : "rgba(255,255,255,0.1)",
                  boxShadow: currentTime > 50 ? "0 0 20px rgba(16,185,129,0.4)" : "none",
                }}
                className="p-3 rounded-2xl bg-white/5 border text-center space-y-1.5"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs">
                  🚀
                </div>
                <div className="text-[11px] font-bold text-white">Webhook Out</div>
                <div className="text-[9px] text-zinc-400">Make / Zapier</div>
              </motion.div>
            </div>

            {/* Execution Result Log Box */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Execution finished: 4 nodes passed in 1.4s</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">HTTP 200 OK</span>
            </div>
          </motion.div>
        )}

        {/* ACT 4: REPURPOSE & CAROUSELS (56s - 72s) */}
        {currentTime >= 56 && currentTime < 72 && (
          <motion.div
            key="act4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-3xl grid grid-cols-2 gap-4"
          >
            {/* Left: YouTube & Repurpose */}
            <div className="p-5 rounded-3xl bg-[#0F0F1A] border border-white/15 space-y-3 shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center text-sm">
                ▶
              </div>
              <h4 className="text-sm font-bold text-white">100% Real YouTube Repurposing</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Extracts timedtext spoken transcripts and converts 40-minute videos into
                high-converting LinkedIn posts and Twitter threads.
              </p>
              <div className="p-2.5 rounded-xl bg-white/5 text-[11px] font-mono text-violet-300 border border-white/10">
                youtube.com/watch?v=... ➔ 1,840 words parsed
              </div>
            </div>

            {/* Right: PDF Carousel Generator */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-900/40 to-pink-900/30 border border-violet-500/30 space-y-3 shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center text-sm">
                📑
              </div>
              <h4 className="text-sm font-bold text-white">5-Slide 1080x1350 PDF Carousels</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Zero-lag client-side generation. Automatically formats your posts into
                high-converting swipeable visual slides.
              </p>
              <div className="flex gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className="flex-1 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    #{s}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ACT 5: 24/7 AUTOPILOT & TELEGRAM BOT (72s - 86s) */}
        {currentTime >= 72 && currentTime < 86 && (
          <motion.div
            key="act5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-3xl flex flex-col gap-4 text-center items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Zero-Ban Architecture & 24/7 Autopilot</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Control Your Growth from Telegram or IDE
            </h3>

            <div className="grid grid-cols-3 gap-3 w-full pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1">
                <Bot className="w-5 h-5 text-blue-400" />
                <div className="text-xs font-bold text-white">Telegram Remote Bot</div>
                <div className="text-[10px] text-zinc-400">
                  Review & approve drafts from your phone
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1">
                <Share2 className="w-5 h-5 text-purple-400" />
                <div className="text-xs font-bold text-white">Webhook Dispatcher</div>
                <div className="text-[10px] text-zinc-400">Connect to Make, Zapier & N8N</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1">
                <Zap className="w-5 h-5 text-amber-400" />
                <div className="text-xs font-bold text-white">MCP Server Suite</div>
                <div className="text-[10px] text-zinc-400">
                  Control LUNVO inside Cursor & Claude
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ACT 6: GRAND FINALE / CALL TO ACTION (86s - 95s) */}
        {currentTime >= 86 && (
          <motion.div
            key="act6"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_50px_rgba(139,92,246,0.6)] animate-pulse">
              L
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Turn Raw Ideas into Viral Authority
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                100% Free & Open Source. Run locally or self-host anywhere. No subscription lock-in.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-2xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Launch LUNVO Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/the-pi-lab/Lunvo"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all"
              >
                Star on GitHub ★
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Control Bar & Timeline Scrubber */}
      <div className="relative z-30 px-6 py-3.5 bg-black/80 backdrop-blur-xl border-t border-white/10 flex flex-col gap-2">
        {/* Scrubber Progress Bar */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            handleSeek(clickPos * TOTAL_DURATION);
          }}
          className="relative w-full h-2 rounded-full bg-white/10 cursor-pointer overflow-hidden group"
        >
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Playback Controls & Chapter Pills */}
        <div className="flex items-center justify-between pt-1">
          {/* Left: Play / Pause / Restart & Time */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 transition-colors shadow-sm"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={() => setCurrentTime(0)}
              title="Restart Demo"
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-zinc-400">
              {Math.floor(currentTime / 60)}:
              {Math.floor(currentTime % 60)
                .toString()
                .padStart(2, "0")}{" "}
              / 1:35
            </span>
          </div>

          {/* Center: Chapter Jump Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5">
            {CHAPTERS.map((c) => {
              const active = currentTime >= c.startTime && currentTime < c.endTime;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSeek(c.startTime)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                    active
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {c.title.split(".")[1]}
                </button>
              );
            })}
          </div>

          {/* Right: Fullscreen & Launch Studio CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-xs"
            >
              <span>Try Live App</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
