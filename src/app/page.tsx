"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, ArrowRight } from "lucide-react";
import SilkCanvas from "@/components/fx/SilkCanvas";
import Cursor from "@/components/fx/Cursor";
import { LocaleToggle } from "@/components/i18n/LocaleToggle";
import GrainOverlay from "@/components/fx/GrainOverlay";
import KineticHeading, { type KineticToken } from "@/components/fx/KineticHeading";
import MagneticCTA from "@/components/entry/MagneticCTA";
import SmoothScroll from "@/components/entry/SmoothScroll";
import Reveal from "@/components/motion/Reveal";
import PipelineTheater from "@/components/entry/PipelineTheater";
import Primitives from "@/components/entry/Primitives";

const MARQUEE_WORDS = ["Write", "SCORE", "Ship", "REPEAT"];

function EditorialMarquee() {
  const Sequence = () => (
    <div className="flex shrink-0 items-center">
      {MARQUEE_WORDS.map((word, i) => (
        <span key={`${word}-${i}`} className="flex items-center">
          <span
            className={`px-10 text-4xl font-serif tracking-tight sm:text-5xl ${
              i % 2 === 1 ? "text-outline" : "text-zinc-900 italic"
            }`}
          >
            {word}
          </span>
          <span className="px-3 text-sm text-blue-500">*</span>
        </span>
      ))}
    </div>
  );
  return (
    <section className="relative z-10 w-full overflow-hidden py-4">
      <div className="marquee-ribbon">
        <div className="overflow-hidden border-y border-zinc-200/40 bg-white/40 backdrop-blur-sm">
          <div className="editorial-marquee flex w-max">
            <Sequence />
            <Sequence />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingNav() {
  return (
    <header className="fixed inset-x-0 top-4 z-[95] flex justify-center px-4">
      <nav className="flex items-center gap-4 rounded-full border border-white/40 bg-white/30 px-4 py-2 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-gradient-to-br from-violet-600 to-blue-600 shadow-sm">
            <span className="text-xs font-bold text-white">L</span>
          </div>
          <span className="font-serif text-lg italic text-zinc-900">LUNVO</span>
        </div>
        <span className="hidden h-4 w-px bg-zinc-900/15 sm:block" />
        <a
          href="https://github.com/the-pi-lab/Lunvo"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden text-sm font-semibold text-zinc-600 hover:text-zinc-900 sm:inline"
        >
          GitHub
        </a>
        <Link
          href="/demo"
          className="text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200/60 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
        >
          <span>Demo</span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
        </Link>
        <LocaleToggle />
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-bold text-white transition-transform hover:scale-105"
        >
          Enter <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>
    </header>
  );
}

export default function EntryPage() {
  const barRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const total = h.scrollHeight - h.clientHeight;
        const p = total > 0 ? window.scrollY / total : 0;
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${p})`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const heroLines: KineticToken[][] = [
    [{ t: "Posts that refuse" }],
    [{ t: "to" }, { t: "scroll by.", em: true }],
  ];

  return (
    <main className="relative">
      <SmoothScroll />

      {/* Soft flowing motion — subtle pastel aurora (not vibrant) */}
      <div className="fixed inset-0 -z-20">
        <SilkCanvas intensity={0.5} speed={0.4} />
      </div>

      <Cursor />
      <GrainOverlay opacity={0.04} />

      {/* scroll progress */}
      <div
        ref={barRef}
        className="fixed top-0 left-0 right-0 z-[100] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500"
      />

      <FloatingNav />

      {/* ===== HERO — large editorial typography as the narrative anchor ===== */}
      <section className="relative min-h-screen">
        <div
          ref={heroRef}
          className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        >
          <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/30 px-4 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-violet-900 backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            The Open-Source LinkedIn OS
          </p>

          <KineticHeading
            lines={heroLines}
            as="h1"
            className="text-5xl font-serif font-medium tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl"
            emClassName="italic text-violet-600"
          />

          <p
            className="mt-7 max-w-xl text-balance text-base text-zinc-700 sm:text-lg"
            style={{ textShadow: "0 2px 30px rgba(251,250,249,0.85)" }}
          >
            A 3-agent AI studio that clones your voice, scores every line live, and never touches
            unofficial APIs. Your keys. Your machine. Zero bans.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center gap-3.5">
            <MagneticCTA href="/dashboard">Enter the Studio</MagneticCTA>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold bg-white/80 hover:bg-white text-violet-950 border border-violet-200/80 shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            >
              <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] shadow-sm">
                ▶
              </span>
              <span>Watch 95s Product Demo</span>
            </Link>
          </div>

          <span className="mt-3 text-[0.625rem] font-mono uppercase tracking-[0.3em] text-violet-800/60">
            No sign-up · No card · MIT licensed
          </span>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[0.5625rem] font-bold uppercase tracking-[0.3em] font-mono text-violet-900/50">
              Scroll
            </span>
            <div className="h-10 w-[1.5px] overflow-hidden rounded-full bg-violet-900/20">
              <div className="h-3 w-full animate-pulse rounded-full bg-violet-600" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== THE PRIMITIVES — quiet editorial feature grid ===== */}
      <Primitives />

      {/* ===== THREE-AGENT SEQUENCE — each act hands focus to the next ===== */}
      <PipelineTheater />

      {/* ===== EDITORIAL MARQUEE — seamless autonomous ticker ===== */}
      <EditorialMarquee />

      {/* ===== BLACK ROUNDED CTA CARD ===== */}
      <section className="relative z-10 px-6 py-24">
        <Reveal>
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[34px] bg-zinc-950 px-8 py-16 text-center shadow-2xl sm:px-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(600px 240px at 50% -10%, rgba(124,58,237,0.5), transparent 70%)",
              }}
            />
            <div className="relative">
              <p className="kicker !text-white/40">The verdict</p>
              <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl">
                Your studio is waiting.
              </h2>
              <p className="mt-4 text-sm text-white/55">
                No sign-up. No card. Runs entirely on your machine.
              </p>
              <div className="mt-9 flex justify-center">
                <MagneticCTA href="/dashboard">Enter the Studio</MagneticCTA>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== CLOUD BANNER — Want to store your data on cloud? Click here ===== */}
      <section className="relative z-10 px-6 py-16">
        <Reveal>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-[24px] bg-white/70 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_12px_40px_rgba(26,24,20,0.08)] p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-[0.625rem] font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Local-first, cloud optional
                </div>
                <h3 className="mt-3 font-serif text-2xl font-medium tracking-tight text-zinc-900">
                  Want to store your data on cloud? Click here
                </h3>
                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                  By default everything stays on <b>your device</b>. Clone from GitHub and connect
                  your own Supabase, Convex, Firebase, Turso, or PlanetScale in one click — we never
                  see your keys.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["Supabase", "Convex", "Firebase", "Turso", "PlanetScale"].map((db) => (
                    <span
                      key={db}
                      className="px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[0.625rem] font-bold uppercase tracking-widest"
                    >
                      {db}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/dashboard/cloud"
                className="shrink-0 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-zinc-800 transition-colors"
              >
                Connect cloud <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== LOOP BACK TOWARD HERO ===== */}
      <section className="relative z-10 px-6 pb-32 pt-10 text-center">
        <Reveal>
          <p className="kicker">The loop</p>
          <h2 className="mx-auto mt-3 max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-zinc-900 sm:text-5xl">
            Tell your story. <em className="italic text-violet-600">We&apos;ll make it land.</em>
          </h2>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-9 inline-flex items-center gap-2 rounded-full border border-violet-900/20 bg-white/40 px-5 py-2.5 text-sm font-bold text-violet-900 backdrop-blur-md transition-transform hover:scale-105"
          >
            Back to top <ArrowUpRight className="h-4 w-4" />
          </button>
        </Reveal>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-outline-variant/40 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900">
              <span className="text-xs font-bold text-white">L</span>
            </div>
            <span className="font-serif italic text-zinc-900">LUNVO</span>
            <span className="text-xs text-zinc-400">© 2026 THE Π LAB</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-500">
            <a
              href="https://github.com/the-pi-lab/Lunvo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900"
            >
              GitHub
            </a>
            <a href="/dashboard" className="hover:text-zinc-900">
              Studio
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
