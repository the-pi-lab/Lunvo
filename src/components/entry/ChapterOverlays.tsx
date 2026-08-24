"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

/* ---------------- Kinetic chapter text ---------------- */

export function SplitWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom"
        >
          <span className="kinetic-word inline-block will-change-transform" data-word={i}>
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

export interface ChapterTextHandle {
  root: HTMLDivElement | null;
  words: NodeListOf<HTMLElement> | null;
}

export function ChapterBlock({
  chapter,
  kicker,
  children,
  registerRef,
}: {
  chapter: number;
  kicker: string;
  children: React.ReactNode;
  registerRef: (chapter: number, el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerRef(chapter, ref.current);
    return () => registerRef(chapter, null);
  }, [chapter, registerRef]);

  return (
    <div
      ref={ref}
      data-chapter={chapter}
      className="pointer-events-none absolute inset-x-0 z-20 opacity-0"
      style={{ top: "50%", transform: "translateY(-50%)" }}
    >
      <div
        className={`max-w-3xl px-6 ${
          chapter === 2 || chapter === 4 ? "ml-auto mr-[6vw] text-right" : "mx-auto text-center"
        }`}
      >
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.3em] font-mono text-primary mb-4">
          {kicker}
        </p>
        <div className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium text-on-background leading-[1.08] tracking-tight">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Score Ring (Critic) ---------------- */

export function ScoreRing({ register }: { register: (el: SVGSVGElement | null) => void }) {
  const [score, setScore] = useState(0);
  const size = 240;
  const r = 104;
  const C = 2 * Math.PI * r;

  useEffect(() => {
    (window as unknown as { __lunvoScoreSetter?: (v: number) => void }).__lunvoScoreSetter = (
      v: number
    ) => {
      setScore(Math.round(v));
    };
    return () => {
      delete (window as unknown as { __lunvoScoreSetter?: (v: number) => void }).__lunvoScoreSetter;
    };
  }, []);

  return (
    <div
      ref={(el) => {
        register(el?.querySelector("svg") ?? null);
      }}
      data-ring
      className="pointer-events-none absolute z-20 opacity-0"
      style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
    >
      <div className="relative w-[240px] h-[240px]">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgba(0,74,198,0.12)"
            strokeWidth={10}
            fill="none"
          />
          <circle
            data-ring-circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#ringGrad)"
            strokeWidth={10}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={C}
            strokeDashoffset={C}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#004AC6" />
              <stop offset="60%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#DB2777" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            data-ring-score
            className="text-6xl font-serif font-medium text-on-background tabular-nums"
          >
            {score}
          </span>
          <span className="text-[0.625rem] font-bold uppercase tracking-[0.3em] font-mono text-on-surface-variant/60 mt-1">
            Virality
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Progress rail ---------------- */

export function ProgressRail({
  fillRef,
}: {
  fillRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-30 h-40 w-[3px] rounded-full bg-outline-variant/40 overflow-hidden">
      <div
        ref={(el) => {
          if (fillRef && "current" in fillRef) fillRef.current = el;
        }}
        className="w-full h-full bg-gradient-to-b from-primary via-primary-container to-tertiary origin-top scale-y-0 rounded-full"
      />
    </div>
  );
}

/* ---------------- Final CTA + flash ---------------- */

export function FinalCTA({
  register,
  onEnter,
}: {
  register: (el: HTMLDivElement | null) => void;
  onEnter: () => void;
}) {
  return (
    <div
      ref={register}
      data-final-cta
      className="pointer-events-none absolute inset-x-0 z-30 opacity-0 text-center"
      style={{ top: "58%" }}
    >
      <div className="pointer-events-auto inline-flex flex-col items-center gap-5">
        <button
          onClick={onEnter}
          className="magnetic group relative inline-flex items-center gap-3 rounded-[16px] p-[1.5px] overflow-hidden"
          data-conic-cta
        >
          <span className="conic-ring absolute inset-[-60%]" aria-hidden />
          <span className="relative inline-flex items-center gap-3 rounded-[15px] bg-white px-9 py-4 text-base font-bold text-on-background">
            Enter the Studio
            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
        <p className="text-[0.625rem] font-mono uppercase tracking-[0.3em] text-on-surface-variant/50">
          No sign-up · No card · Your machine
        </p>
      </div>
    </div>
  );
}

export function FlashOverlay({ register }: { register: (el: HTMLDivElement | null) => void }) {
  return (
    <div
      ref={register}
      data-flash
      className="fixed inset-0 z-[90] bg-[#FBFAF9] opacity-0 pointer-events-none"
    />
  );
}
