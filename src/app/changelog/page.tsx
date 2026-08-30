"use client";

import { useState } from "react";
import Link from "next/link";
import { Verified, Sparkles, Rocket, ArrowLeft } from "lucide-react";

// --- Metadata (for Client Component) ---
// const metadata... (Cannot export metadata from client component, removing)

const ENTRIES = [
  {
    version: "v2.0.0",
    category: "Features",
    date: "Aug 30, 2026",
    badge: {
      label: "Major",
      icon: <Rocket className="w-4 h-4" />,
      color: "bg-secondary/10 text-secondary",
    },
    title: "LUNVO 2.0 — The Open Source LinkedIn OS",
    description:
      "44 phases, 15 contributors, 0 SaaS tax. BYOK 48 providers + Ollama, Voice DNA 4 sliders, Tiptap Editor V2, Repurposer LIVE, Carousel 1080×1350 PDF, Humanizer 90%+, Distribution (Copy→LinkedIn + share + webhook + .ics), Drafts V2, Marketplace, Docker, CI, MCP, Privacy, i18n (hi).",
    details: (
      <div className="space-y-4">
        <div className="bg-surface-container rounded-[8px] p-6 font-mono text-[0.8125rem] text-on-surface-variant border-l-4 border-primary leading-relaxed">
          <h4 className="text-[0.625rem] uppercase font-bold mb-3 text-on-background tracking-wider">
            Highlights — Phases 18-44:
          </h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">→</span>
              <span>Image Studio 6 pro styles + Relevancy/Prompt toggle + fallback canvas</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">→</span>
              <span>
                News 8 APIs (Currents, NewsAPI, GNews…) + Distribution BYOC (Zapier/Twitter/Reddit)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">→</span>
              <span>
                Carousel 5 templates → PDF, Humanizer 90%+, Streaming word-by-word, Cost Guard IP
                5/day
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">→</span>
              <span>Cloud 5 DBs (Supabase/Convex/Firebase/Turso/PlanetScale) + landing banner</span>
            </li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            Week2 1500 stars
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
            20 contributors
          </span>
          <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-mono">
            Keep a Changelog
          </span>
        </div>
      </div>
    ),
    active: true,
  },
  {
    version: "v1.2",
    category: "Features",
    date: "Oct 24, 2023",
    badge: {
      label: "Feature",
      icon: <Verified className="w-4 h-4" />,
      color: "bg-secondary/10 text-secondary",
    },
    title: "Saved Drafts",
    description:
      'We\'ve introduced a robust draft management system. You can now save multiple versions of your LinkedIn posts, revisit them later, and even set internal status markers like "Researching" or "Ready for Review."',
    details: (
      <div className="bg-surface-container rounded-[8px] p-6 font-mono text-[0.8125rem] text-on-surface-variant border-l-4 border-primary leading-relaxed">
        <h4 className="text-[0.625rem] uppercase font-bold mb-3 text-on-background tracking-wider">
          Key Capabilities:
        </h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-primary mt-0.5">→</span>
            <span>Auto-save functionality every 30 seconds to prevent data loss.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary mt-0.5">→</span>
            <span>
              Version history toggle to compare changes across different drafting sessions.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary mt-0.5">→</span>
            <span>Multi-tag support for organizing drafts by campaign or client.</span>
          </li>
        </ul>
      </div>
    ),
    active: false,
  },
  {
    version: "v1.1",
    category: "Improvements",
    date: "Sep 12, 2023",
    badge: {
      label: "Improvement",
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-primary/10 text-primary",
    },
    title: "Smarter AI Rewrites",
    description:
      'Our AI engine has been fine-tuned for the LinkedIn ecosystem. It now understands "The Hook" and "The CTA" better than ever, producing content that feels less like a bot and more like a seasoned strategist.',
    details: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        <div className="bg-surface-container rounded-[8px] p-5">
          <span className="block font-mono text-[0.5625rem] uppercase text-on-surface-variant/50 mb-2 tracking-widest">
            Old Algorithm
          </span>
          <p className="text-[0.875rem] italic text-on-surface-variant line-through">
            &ldquo;Here are five ways to grow your network on the platform using strategic
            outreach...&rdquo;
          </p>
        </div>
        <div className="bg-primary/5 rounded-[8px] p-5 ring-1 ring-primary/10">
          <span className="block font-mono text-[0.5625rem] uppercase text-primary mb-2 tracking-widest">
            New Algorithm (v1.1)
          </span>
          <p className="text-[0.875rem] font-medium text-on-background">
            &ldquo;Most outreach is noise. Here are the 5 exact frameworks I use to cut through the
            static...&rdquo;
          </p>
        </div>
      </div>
    ),
    active: false,
  },
  {
    version: "v1.0",
    category: "Features",
    date: "Aug 01, 2023",
    badge: {
      label: "Launch",
      icon: <Rocket className="w-4 h-4" />,
      color: "bg-tertiary/10 text-tertiary",
    },
    title: "Hello, World.",
    description:
      "Today we launch LUNVO. A dedicated workspace for LinkedIn power users who want to treat their personal brand like a premier editorial desk.",
    details: (
      <div className="flex flex-wrap gap-3 mt-4">
        {["Growth Analytics", "AI Post Editor", "Scheduling"].map((f) => (
          <div
            key={f}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-[0.8125rem] font-medium"
          >
            <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {f}
          </div>
        ))}
      </div>
    ),
    active: false,
  },
];

const FILTERS = ["All Updates", "Features", "Improvements", "Fixes"];

export default function ChangelogPage() {
  const [activeFilter, setActiveFilter] = useState("All Updates");

  const filteredEntries =
    activeFilter === "All Updates" ? ENTRIES : ENTRIES.filter((e) => e.category === activeFilter);

  return (
    <main className="min-h-screen bg-background text-on-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-[rgba(229,226,218,0.3)]">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-serif italic text-xl text-on-background">LUNVO</span>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-[0.8125rem] font-medium text-on-surface-variant hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/drafts"
                className="text-[0.8125rem] font-medium text-on-surface-variant hover:text-primary transition-colors"
              >
                Drafts
              </Link>
              <span className="text-[0.8125rem] font-bold text-primary">Changelog</span>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[0.8125rem] text-on-surface-variant hover:text-primary transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-16 md:py-24">
        {/* Hero */}
        <div className="mb-20">
          <h1 className="text-5xl md:text-7xl font-serif text-on-background tracking-tight mb-6">
            What&apos;s new
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed">
            Stay updated with the latest improvements, features, and refinements at LUNVO.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 mb-16">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full font-bold text-[0.8125rem] transition-all ring-1 ${
                activeFilter === f
                  ? "bg-gradient-to-br from-primary-container to-primary text-on-primary ring-primary/20 shadow-md"
                  : "bg-surface-container text-on-surface-variant ring-[rgba(229,226,218,0.3)] hover:bg-surface-container-high"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-0 md:left-32 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary to-transparent opacity-20" />

          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <div
                key={entry.version}
                className="relative grid grid-cols-1 md:grid-cols-[128px_1fr] gap-8 mb-24 items-start"
              >
                <div className="hidden md:block pr-8 text-right pt-2">
                  <span className="font-mono text-[0.6875rem] text-on-surface-variant/50 uppercase tracking-widest block mb-1">
                    {entry.date}
                  </span>
                  <span className="font-bold text-primary text-[0.875rem] uppercase">
                    {entry.version}
                  </span>
                </div>

                <div className="pl-8 md:pl-12 relative">
                  <div className="md:hidden flex items-center gap-3 mb-4">
                    <span className="font-mono text-[0.6875rem] text-on-surface-variant/50 uppercase">
                      {entry.date}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[0.5625rem] font-bold">
                      {entry.version}
                    </span>
                  </div>

                  <div
                    className={`absolute left-[-5px] md:left-[-41px] top-3 w-2.5 h-2.5 rounded-full border-2 border-background z-10 ${
                      entry.active
                        ? "bg-primary ring-4 ring-primary/10"
                        : "bg-on-surface-variant/40"
                    }`}
                  />

                  <div className="bg-surface-container-lowest rounded-[12px] p-8 md:p-10 shadow-premium ring-1 ring-[rgba(229,226,218,0.3)]">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${entry.badge.color} mb-6`}
                    >
                      {entry.badge.icon}
                      <span className="text-[0.5625rem] font-bold uppercase tracking-widest">
                        {entry.badge.label}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-on-background mb-4">
                      {entry.title}
                    </h2>
                    <p className="text-on-surface-variant leading-relaxed text-[1rem] mb-6">
                      {entry.description}
                    </p>
                    {entry.details}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="pl-40 text-on-surface-variant/50 font-serif italic text-xl">
              No updates in this category yet.
            </div>
          )}
        </div>

        {/* Discord + Weekly Thank You — Keep a Changelog + Community */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="rounded-[12px] p-6 bg-gradient-to-br from-violet-600 to-indigo-600 text-white ring-1 ring-black/10 shadow-premium">
            <h3 className="font-serif text-xl">Join Discord</h3>
            <p className="text-sm text-white/80 mt-2 leading-relaxed">
              Questions, launch feedback, and weekly office hours — 20 contributors and counting.
            </p>
            <a
              href="https://discord.gg/lunvo"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-zinc-900 text-xs font-bold hover:bg-zinc-100 transition-colors"
            >
              discord.gg/lunvo
            </a>
            <p className="text-[0.625rem] font-mono uppercase tracking-widest text-white/50 mt-3">
              Week2 1500 stars • 20 contributors
            </p>
          </div>
          <div className="rounded-[12px] p-6 bg-surface-container-lowest ring-1 ring-[rgba(229,226,218,0.3)] shadow-premium">
            <h3 className="font-serif text-xl text-on-background">Weekly Thank You</h3>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Every Monday we tweet a Thank You thread for new contributors — auto-generated via
              LUNVO itself.
            </p>
            <a
              href="https://twitter.com/intent/tweet?text=Thank%20you%20to%20our%2020%20contributors%20%E2%80%94%20LUNVO%20Week2%201500%20stars%20%F0%9F%9A%80%20github.com/the-pi-lab/Lunvo"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
            >
              Tweet thanks →
            </a>
            <p className="text-[0.625rem] font-mono uppercase tracking-widest text-on-surface-variant/40 mt-3">
              Keep a Changelog — https://keepachangelog.com
            </p>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-12 border-t border-[rgba(229,226,218,0.3)] pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-on-surface-variant text-[0.75rem] font-mono uppercase tracking-widest">
            End of Recent Updates
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-[0.875rem]">
              ← Earlier Updates
            </button>
            <div className="w-px h-4 bg-[rgba(229,226,218,0.4)]" />
            <button className="text-on-surface-variant hover:text-primary transition-colors font-medium text-[0.875rem]">
              Archive
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
