"use client";

import { Bot, Layers, ShieldCheck, Zap, type LucideIcon } from "lucide-react";
import Reveal from "@/components/motion/Reveal";

interface Primitive {
  title: string;
  desc: string;
  Icon: LucideIcon;
  iconWrap: string;
}

const PRIMITIVES: Primitive[] = [
  {
    title: "3-Agent Pipeline",
    desc: "Scout finds the angle. Writer clones your Voice DNA. Critic scores 94/100. One topic → publish-ready post.",
    Icon: Bot,
    iconWrap: "bg-blue-100/70 text-blue-600",
  },
  {
    title: "48 AI Providers",
    desc: "OpenAI to Groq to your localhost. Bring any key, switch anytime, stack free tiers for months.",
    Icon: Layers,
    iconWrap: "bg-violet-100/70 text-violet-600",
  },
  {
    title: "Zero-Ban by Design",
    desc: "No unofficial APIs. No browser extensions. Your account stays yours. Clipboard-first, account-safe.",
    Icon: ShieldCheck,
    iconWrap: "bg-emerald-100/60 text-emerald-600",
  },
  {
    title: "Auto-Failover Vault",
    desc: "One key hits its limit? The next one takes over mid-flight. Zero downtime, zero thinking.",
    Icon: Zap,
    iconWrap: "bg-amber-100/60 text-amber-600",
  },
];

export default function Primitives() {
  return (
    <section className="relative z-10 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <Reveal>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.4em] text-zinc-400">
              The Primitives
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-6 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              Everything you need.
              <br />
              <span className="italic text-blue-600">Nothing you don&apos;t.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 text-sm text-zinc-500 sm:text-base">
              Four instruments that replace $199/mo of SaaS wrappers.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PRIMITIVES.map((p, i) => (
            <Reveal key={p.title} delay={0.1 + i * 0.1} y={20}>
              <div className="h-full rounded-3xl border border-white/60 bg-white/40 p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md sm:p-8">
                <div
                  className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${p.iconWrap}`}
                >
                  <p.Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl font-medium text-zinc-900">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
