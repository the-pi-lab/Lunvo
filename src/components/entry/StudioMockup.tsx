"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Dna,
  Zap,
  ShieldCheck,
} from "lucide-react";

const DEMO_LINES = [
  "84 cold DMs. 3 replies.",
  "Here is what changed:",
  "I stopped pitching first.",
  "I listened instead.",
  "Replies tripled in 2 weeks.",
];

const FULL_DEMO = DEMO_LINES.join("\n\n");

function useTyping(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    let holdTimeout: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          // Hold full text, then reset and loop forever
          clearInterval(interval);
          holdTimeout = setTimeout(() => {
            i = 0;
            setDisplayed("");
            interval = setInterval(() => {
              i += 1;
              setDisplayed(text.slice(0, i));
              if (i >= text.length) clearInterval(interval);
            }, speed);
          }, 3000);
        }
      }, speed);
    }, 600);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
      clearTimeout(holdTimeout);
    };
  }, [text, speed]);
  return displayed;
}

function ScoreChips({ active }: { active: boolean }) {
  return (
    <div className="flex gap-2">
      {[
        { label: "Hook", score: 8, color: "text-secondary" },
        { label: "Flow", score: 9, color: "text-secondary" },
        { label: "CTA", score: 7, color: "text-tertiary" },
      ].map(({ label, score, color }) => (
        <div
          key={label}
          className={`flex-1 rounded-[10px] px-3 py-2 text-center transition-all duration-500 ${
            active
              ? "bg-surface-container-low ring-1 ring-outline-variant/40"
              : "bg-surface-container opacity-40"
          }`}
        >
          <p className="text-[0.5625rem] font-bold uppercase tracking-widest font-mono text-on-surface-variant/60">
            {label}
          </p>
          <p
            className={`text-xl font-serif font-medium ${active ? color : "text-on-surface-variant/30"}`}
          >
            {score}
          </p>
        </div>
      ))}
    </div>
  );
}

function CriticPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-secondary">94</span>
        </div>
        <div>
          <p className="text-xs font-bold text-on-background">Critic Score</p>
          <p className="text-[0.625rem] text-on-surface-variant">Viral potential</p>
        </div>
        <span className="ml-auto w-2 h-2 rounded-full bg-secondary animate-pulse" />
      </div>
      <div className="space-y-2">
        {[
          {
            icon: AlertCircle,
            color: "text-error",
            bg: "bg-error/10",
            text: "Weak hook — add a number",
          },
          {
            icon: BarChart3,
            color: "text-tertiary",
            bg: "bg-tertiary/10",
            text: "CTA could be more specific",
          },
          {
            icon: CheckCircle2,
            color: "text-secondary",
            bg: "bg-secondary/10",
            text: "Readable, well-spaced",
          },
        ].map(({ icon: Icon, color, bg, text }) => (
          <div key={text} className="flex items-center gap-2 text-xs">
            <span
              className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-3 h-3 ${color}`} />
            </span>
            <span className="text-on-surface-variant">{text}</span>
          </div>
        ))}
      </div>
      <div className="rounded-[10px] bg-surface-container-low p-3 text-xs leading-relaxed text-on-surface-variant">
        <span className="font-bold text-on-background">Rewrite:</span> 84 cold DMs. 3 replies. I
        stopped pitching...
      </div>
    </motion.div>
  );
}

function VaultPanel() {
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % 3), 2200);
    return () => clearInterval(id);
  }, []);
  const providers = [
    {
      name: "Groq",
      model: "llama-3.3-70b",
      status: "limit hit",
      color: "bg-error/15 text-error border-error/30",
    },
    {
      name: "Cerebras",
      model: "llama3.1-8b",
      status: "active",
      color: "bg-secondary/15 text-secondary border-secondary/30",
    },
    {
      name: "OpenAI",
      model: "gpt-4o-mini",
      status: "standby",
      color: "bg-surface-container text-on-surface-variant border-outline-variant/40",
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-2.5"
    >
      <div className="flex items-center gap-2 mb-1">
        <Dna className="w-3.5 h-3.5 text-primary" />
        <span className="text-[0.625rem] font-bold uppercase tracking-widest font-mono text-primary">
          Auto-Failover Vault
        </span>
      </div>
      {providers.map((p, i) => (
        <div
          key={p.name}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] border text-xs font-semibold transition-all duration-500 ${
            i === activeIdx ? "scale-[1.02] shadow-sm " + p.color : p.color + " opacity-60"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${i === activeIdx && p.status === "active" ? "bg-secondary animate-pulse" : i === 0 ? "bg-error" : "bg-on-surface-variant/30"}`}
          />
          <span className="flex-1 truncate">{p.name}</span>
          <span className="text-[0.625rem] font-mono opacity-60">{p.model}</span>
          <span
            className={`text-[0.5625rem] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${i === activeIdx ? "bg-white/60" : "bg-white/40"}`}
          >
            {i === activeIdx ? (i === 0 ? "limit" : "active") : p.status}
          </span>
        </div>
      ))}
      <p className="text-[0.625rem] text-center text-on-surface-variant/50 font-mono">
        One limit hit → next takes over instantly
      </p>
    </motion.div>
  );
}

export default function StudioMockup({
  step = 0,
  hero = false,
}: {
  step?: number;
  hero?: boolean;
}) {
  const typed = useTyping(FULL_DEMO, 28);

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] ${
        hero ? "rotate-[1deg] hover:rotate-0 transition-transform duration-700" : ""
      }`}
      style={hero ? { transform: "perspective(1200px) rotateX(2deg)" } : undefined}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-black/[0.06] bg-[#FAFAF9]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-black/10" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10" />
          <span className="w-3 h-3 rounded-full bg-[#28CA42] border border-black/10" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="px-3 py-1 rounded-full bg-white border border-black/10 text-[0.625rem] font-medium text-on-surface-variant flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-secondary" /> studio.lunvo.ai
          </span>
        </div>
        <span className="w-16" />
      </div>

      <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-0">
        {/* Editor */}
        <div className="p-4 sm:p-5 border-r border-black/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-[0.6875rem] font-bold uppercase tracking-widest font-mono text-on-surface-variant">
              Editor
            </span>
            <span className="ml-auto text-[0.625rem] font-mono text-on-surface-variant/50">
              {typed.length} chars
            </span>
          </div>
          <div className="min-h-[160px] rounded-[12px] bg-[#FDFCFB] border border-black/[0.06] p-4">
            <pre className="whitespace-pre-wrap text-[0.8125rem] leading-relaxed font-mono text-on-background">
              {typed}
              <span className="inline-block w-[2px] h-4 bg-primary ml-0.5 animate-pulse align-middle" />
            </pre>
          </div>
          <div className="mt-3">
            <ScoreChips active={step >= 0} />
          </div>
        </div>

        {/* Right pane — step content */}
        <div className="p-4 sm:p-5 bg-[#FCFCFD] min-h-[280px] flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-[0.625rem] font-bold uppercase tracking-widest font-mono text-on-surface-variant/60">
            <span
              className={`px-2 py-1 rounded-full text-white text-[0.5625rem] ${step === 0 ? "bg-primary" : step === 1 ? "bg-tertiary" : "bg-secondary"}`}
            >
              Step {step + 1} / 3
            </span>
            <span>{step === 0 ? "Scout" : step === 1 ? "Critic" : "Vault"}</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="scout"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-on-background">
                    Scout finds the angle
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Data Hook", active: true },
                    { label: "Story Hook", active: false },
                    { label: "Contrarian", active: false },
                  ].map((h) => (
                    <div
                      key={h.label}
                      className={`px-3 py-2.5 rounded-[10px] border text-xs font-semibold flex items-center gap-2 ${h.active ? "bg-primary text-white border-primary shadow-sm" : "bg-white border-black/10 text-on-surface-variant"}`}
                    >
                      <Zap
                        className={`w-3.5 h-3.5 ${h.active ? "text-white" : "text-on-surface-variant/40"}`}
                      />
                      {h.label}
                      {h.active && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 1 && <CriticPanel key="critic" />}
            {step === 2 && <VaultPanel key="vault" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
