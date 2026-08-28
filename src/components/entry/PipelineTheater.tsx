"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, PenTool, BadgeCheck } from "lucide-react";

const ACTS = [
  {
    n: "01",
    icon: Search,
    kicker: "Act I — Discovery",
    title: "Scout reads the market.",
    desc: "Live trend signals and high-performing structures are scanned to find the one angle worth your name — data, story, or contrarian.",
  },
  {
    n: "02",
    icon: PenTool,
    kicker: "Act II — Voice",
    title: "Writer speaks like you.",
    desc: "Your Voice DNA is injected into every sentence. Cadence, vocabulary, opinion — cloned, not approximated.",
  },
  {
    n: "03",
    icon: BadgeCheck,
    kicker: "Act III — Verdict",
    title: "Critic refuses mediocrity.",
    desc: "Twenty-plus viral parameters. Brutal edits. A final score you can defend. Nothing ships at anything less.",
  },
];

function RadarVisual({ active }: { active: boolean }) {
  return (
    <div className="relative w-full aspect-square max-w-[340px] mx-auto">
      <div className="absolute inset-0 rounded-full border border-primary/20" />
      <div className="absolute inset-[14%] rounded-full border border-primary/15" />
      <div className="absolute inset-[30%] rounded-full border border-primary/10" />
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, rgba(0,74,198,0.35), transparent 70deg)",
          }}
          animate={active ? { rotate: 360 } : {}}
          transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {[
        { top: "28%", left: "62%", d: 0 },
        { top: "58%", left: "34%", d: 0.9 },
        { top: "42%", left: "22%", d: 1.7 },
      ].map((b, i) => (
        <span key={i} className="absolute" style={{ top: b.top, left: b.left }}>
          <span
            className={`absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-60 ${
              active ? "animate-ping" : ""
            }`}
            style={{ animationDelay: `${b.d}s` }}
          />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white shadow-premium ring-1 ring-outline-variant/40 flex items-center justify-center">
        <Search className="w-5 h-5 text-primary" />
      </div>
    </div>
  );
}

function WriterVisual({ active }: { active: boolean }) {
  return (
    <div className="relative w-full max-w-[340px] mx-auto space-y-4">
      <div className="rounded-2xl bg-white ring-1 ring-outline-variant/40 shadow-premium p-6">
        {[92, 78, 96, 64].map((w, i) => (
          <div key={i} className="flex items-center gap-3 mb-4 last:mb-0">
            <motion.span
              className="h-2 rounded-full bg-gradient-to-r from-primary/70 to-violet-400/50"
              style={{ width: `${w}%`, transformOrigin: "left" }}
              initial={{ scaleX: 0 }}
              animate={active ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: i * 0.18, ease: [0.21, 0.47, 0.32, 0.98] }}
            />
          </div>
        ))}
        <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full bg-secondary ${active ? "animate-pulse" : ""}`} />
          <span className="kicker">Injecting Voice DNA</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="ml-auto w-fit px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-mono tracking-widest shadow-premium"
      >
        tone_match: 98.2%
      </motion.div>
    </div>
  );
}

function CriticVisual({ active }: { active: boolean }) {
  const R = 56;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative w-full aspect-square max-w-[340px] mx-auto flex items-center justify-center">
      <svg viewBox="0 0 140 140" className="w-full max-w-[300px] -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={R}
          fill="none"
          stroke="rgb(var(--outline-variant) / 0.4)"
          strokeWidth="7"
        />
        <motion.circle
          cx="70"
          cy="70"
          r={R}
          fill="none"
          stroke="rgb(var(--primary))"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={active ? { strokeDashoffset: C * (1 - 0.94) } : { strokeDashoffset: C }}
          transition={{ duration: 1.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-serif text-5xl sm:text-6xl text-on-background tracking-tight">
          {active ? "94" : "—"}
          <span className="text-xl text-on-surface-variant/40">/100</span>
        </p>
        <p className="kicker mt-1">Verdict</p>
      </div>
    </div>
  );
}

export default function PipelineTheater() {
  const ref = useRef<HTMLDivElement>(null);
  const [act, setAct] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(2, Math.max(0, Math.floor(v * 3)));
    setAct(idx);
  });

  return (
    <section ref={ref} className="relative h-[320vh]" id="pipeline">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative min-h-[380px] sm:min-h-[340px]">
            {ACTS.map((a, i) => (
              <motion.div
                key={a.n}
                className="absolute inset-0 flex flex-col justify-center"
                initial={false}
                animate={{
                  opacity: act === i ? 1 : 0,
                  y: act === i ? 0 : i > act ? 40 : -40,
                  filter: act === i ? "blur(0px)" : "blur(8px)",
                }}
                transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
                aria-hidden={act !== i}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono text-sm font-bold text-primary tracking-widest">
                    {a.n}
                  </span>
                  <span className="h-px w-10 bg-primary/30" />
                  <span className="kicker">{a.kicker}</span>
                </div>
                <h3 className="text-4xl sm:text-5xl font-serif text-on-background tracking-tight leading-[1.05]">
                  {a.title.split(" ").slice(0, -1).join(" ")}{" "}
                  <em className="italic text-primary">{a.title.split(" ").slice(-1)}</em>
                </h3>
                <p className="mt-5 text-on-surface-variant leading-relaxed max-w-md">{a.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="relative min-h-[340px] sm:min-h-[400px]">
            {ACTS.map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                initial={false}
                animate={{
                  opacity: act === i ? 1 : 0,
                  scale: act === i ? 1 : 0.92,
                  rotateY: act === i ? 0 : 18,
                }}
                transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
                aria-hidden={act !== i}
              >
                {i === 0 && <RadarVisual active={act === 0} />}
                {i === 1 && <WriterVisual active={act === 1} />}
                {i === 2 && <CriticVisual active={act === 2} />}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {ACTS.map((a, i) => (
            <div
              key={a.n}
              className={`h-1 rounded-full transition-all duration-500 ${
                act === i ? "w-10 bg-primary" : "w-4 bg-outline-variant/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
