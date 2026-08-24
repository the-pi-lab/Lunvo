"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Zap, ShieldCheck, Layers, BrainCircuit } from "lucide-react";
import { PROVIDER_REGISTRY } from "@/lib/ai/providers/registry";
import { analyzeLocally } from "@/lib/analysis/localHeuristics";
import dynamic from "next/dynamic";

const AuroraScene = dynamic(() => import("@/components/landing/AuroraScene"), { ssr: false });

const DEMO_POST =
  "84 cold DMs. 3 replies. Here is what I changed.\n\nI stopped pitching in message one.\n\nInstead I asked about their biggest blocker — and actually listened.\n\nReplies tripled in two weeks.\n\nWhat is the one thing you wish you knew before your first outreach?";

function useTypewriter(text: string, speed = 34, startDelay = 600) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setTyped(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);
  return typed;
}

function StudioDemo() {
  const typed = useTypewriter(DEMO_POST);
  const live = useMemo(() => analyzeLocally(typed), [typed]);
  const started = typed.length > 0;

  return (
    <div className="glass rounded-[20px] !border-transparent p-5 sm:p-6 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-aurora-peach/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-aurora-mint/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-aurora-lavender/80" />
        </div>
        <span className="text-[0.5625rem] font-bold uppercase tracking-widest font-mono text-on-surface-variant/50">
          Live Studio Preview
        </span>
      </div>

      <div className="min-h-[150px] text-[0.8125rem] font-mono leading-relaxed text-on-background whitespace-pre-line">
        {typed}
        <span className="inline-block w-[2px] h-4 bg-primary align-middle ml-0.5 animate-pulse" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-outline-variant/40">
        {(
          [
            ["Hook", live.scores.hook.score],
            ["Flow", live.scores.readability.score],
            ["CTA", live.scores.engagement.score],
          ] as const
        ).map(([label, score]) => (
          <div key={label} className="text-center">
            <p className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-1">
              {label}
            </p>
            <p
              className={`text-2xl font-serif transition-colors duration-500 ${
                !started
                  ? "text-on-surface-variant/30"
                  : score >= 7
                    ? "text-secondary"
                    : score >= 5
                      ? "text-tertiary"
                      : "text-error"
              }`}
            >
              {started ? score : "–"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProviderMarquee() {
  const providers = PROVIDER_REGISTRY.filter((p) => !p.coming);
  const doubled = [...providers, ...providers];
  return (
    <div className="overflow-hidden py-4 border-y border-outline-variant/30">
      <div className="marquee-track flex w-max items-center gap-8 px-6">
        {doubled.map((p, i) => (
          <span key={`${p.id}-${i}`} className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-sm font-semibold text-on-background/70">{p.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "3-Agent Pipeline",
    desc: "Scout finds the angle, Writer clones your Voice DNA, Critic scores it.",
  },
  {
    icon: Layers,
    title: "48 AI Providers",
    desc: "OpenAI to Groq to your localhost — bring any key, switch anytime.",
  },
  {
    icon: ShieldCheck,
    title: "Zero-Ban by Design",
    desc: "No unofficial APIs. Your account stays yours. Clipboard-first publishing.",
  },
  {
    icon: Zap,
    title: "Auto-Failover Vault",
    desc: "One key hits its limit? The next one takes over mid-flight.",
  },
];

export default function EntryPage() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  const enter = () => {
    setEntering(true);
    router.push("/dashboard");
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* 3D Aurora scene */}
      <div className="absolute inset-0 z-0">
        <AuroraScene />
      </div>

      {/* Extra aurora blobs for the entry moment */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="aurora-blob w-[500px] h-[500px] -top-40 left-[10%]"
          style={{ backgroundColor: "rgb(var(--aurora-lavender) / 0.6)" }}
        />
        <div
          className="aurora-blob w-[440px] h-[440px] top-[20%] -right-32"
          style={{ backgroundColor: "rgb(var(--aurora-sky) / 0.55)", animationDelay: "-8s" }}
        />
        <div
          className="aurora-blob w-[400px] h-[400px] bottom-[-100px] left-[40%]"
          style={{ backgroundColor: "rgb(var(--aurora-rose) / 0.4)", animationDelay: "-14s" }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-5">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md">
            <span className="text-on-primary font-bold text-sm">L</span>
          </div>
          <span className="font-serif italic text-xl text-on-background">LUNVO</span>
        </div>
        <span className="text-[0.625rem] font-bold uppercase tracking-widest font-mono text-on-surface-variant/60 px-3 py-1.5 rounded-full glass !border-transparent">
          v2.0 — Open Source
        </span>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-14 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-primary/90 mb-5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
            <Sparkles className="w-3 h-3" />
            The Open-Source LinkedIn OS
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-on-background leading-[1.02] mb-6 tracking-tight">
            Write posts that
            <br />
            <span className="aurora-text">refuse to scroll by.</span>
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant max-w-md mx-auto lg:mx-0 leading-relaxed mb-8">
            A 3-agent AI studio that clones your voice, scores every line live, and never touches
            unofficial APIs. Your keys. Your machine. Zero bans.
          </p>

          <button
            onClick={enter}
            disabled={entering}
            className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 rounded-[14px] text-on-primary text-base font-bold tracking-wide shadow-premium transition-all active:scale-[0.98] disabled:opacity-80 overflow-hidden bg-gradient-to-br from-primary to-primary-container hover:shadow-[0_8px_40px_rgb(0_74_198/0.35)]"
          >
            <span className="absolute inset-0 rounded-[14px] bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">{entering ? "Entering..." : "Enter the Studio"}</span>
            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 mt-6 text-xs font-semibold text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> No sign-up. No card.
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-tertiary" /> Runs on your machine
            </span>
          </div>
        </div>

        <StudioDemo />
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass glow-hover rounded-[16px] !border-transparent p-5">
            <div className="w-9 h-9 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Icon className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-bold text-on-background mb-1.5">{title}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      {/* Provider marquee */}
      <section className="relative z-10 pb-6">
        <p className="text-center text-[0.625rem] font-bold uppercase tracking-widest font-mono text-on-surface-variant/50 mb-2">
          Bring a key from any of these
        </p>
        <ProviderMarquee />
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <button
          onClick={enter}
          className="group inline-flex items-center gap-3 px-10 py-4 rounded-[14px] glass glow-hover !border-transparent text-on-background text-base font-bold"
        >
          Enter the Studio
          <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-[0.6875rem] font-mono uppercase tracking-widest text-on-surface-variant/40 mt-4">
          MIT Licensed · Built by THE Π LAB
        </p>
      </section>

      <style jsx>{`
        .marquee-track {
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
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
