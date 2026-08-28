"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Copy,
  Check,
  Filter,
} from "lucide-react";
import PageHeader from "@/components/premium/PageHeader";
import Reveal from "@/components/motion/Reveal";
import { MARKETPLACE_TEMPLATES } from "@/lib/marketplace/templates";
import type { GeneratedLinkedInPost } from "@/lib/rss/types";

type Tab = "templates" | "hooks";

export default function LearnPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("templates");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [hooks, setHooks] = useState<GeneratedLinkedInPost[]>([]);
  const [hooksLoading, setHooksLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(MARKETPLACE_TEMPLATES.map((t) => t.category)))],
    []
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MARKETPLACE_TEMPLATES.filter((t) => {
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.prompt.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesCat = category === "all" || t.category === category;
      return matchesSearch && matchesCat;
    });
  }, [search, category]);

  // Fetch daily hooks via rss/aiService (generate-posts API)
  useEffect(() => {
    if (tab !== "hooks") return;
    const fetchHooks = async () => {
      setHooksLoading(true);
      try {
        const res = await fetch("/api/generate-posts", { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          const posts: GeneratedLinkedInPost[] =
            data.posts || data.generatedPostsCache || data.cachedFeeds || [];
          // Normalize: generate-posts returns {posts: GeneratedLinkedInPost[]}
          if (Array.isArray(posts) && posts.length > 0) {
            setHooks(posts.slice(0, 6));
          } else {
            // Fallback: use trending search
            const r2 = await fetch(`/api/search-trending?q=AI&limit=6`);
            if (r2.ok) {
              const d2 = await r2.json();
              const arts = d2.articles || [];
              setHooks(
                arts.slice(0, 6).map((a: { title: string }) => ({
                  post: a.title,
                  title: a.title,
                  source: "Trending",
                  generatedAt: new Date().toISOString(),
                  fallback: true,
                }))
              );
            }
          }
        }
      } catch {
        // silent
      } finally {
        setHooksLoading(false);
      }
    };
    fetchHooks();
  }, [tab]);

  const handleUseTemplate = (prompt: string) => {
    // Prefill Create via URL + localStorage
    try {
      localStorage.setItem("lunvo_prefill_topic", prompt);
    } catch {}
    router.push(`/dashboard/create?template=${encodeURIComponent(prompt)}`);
  };

  const handleCopyHook = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <PageHeader
        kicker="Marketplace"
        title={
          <>
            Templates &amp; <em className="italic">hooks.</em>
          </>
        }
        description="PR templates and daily trending hooks — one click to prefill the factory. Built from rss/aiService daily hooks."
      />

      {/* Tabs */}
      <Reveal delay={0.05}>
        <div className="flex items-end gap-6 border-b border-outline-variant/30">
          <button
            onClick={() => setTab("templates")}
            className={`relative pb-3.5 text-sm font-semibold flex items-center gap-2 ${tab === "templates" ? "text-on-background" : "text-on-surface-variant/70 hover:text-on-background"}`}
          >
            <BookOpen className="w-4 h-4" /> Templates
            {tab === "templates" && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab("hooks")}
            className={`relative pb-3.5 text-sm font-semibold flex items-center gap-2 ${tab === "hooks" ? "text-on-background" : "text-on-surface-variant/70 hover:text-on-background"}`}
          >
            <TrendingUp className="w-4 h-4" /> Daily Hooks
            {tab === "hooks" && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </Reveal>

      {/* Search + Filter */}
      <Reveal delay={0.08}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "templates" ? "Search templates…" : "Search hooks…"}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 text-sm text-on-background outline-none placeholder:text-on-surface-variant/40"
            />
          </div>
          {tab === "templates" && (
            <div className="flex items-center gap-1 p-1 rounded-full bg-white ring-1 ring-outline-variant/30">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${category === c ? "bg-zinc-900 text-white shadow" : "text-on-surface-variant hover:text-on-background"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* Templates grid */}
      {tab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t, idx) => (
            <Reveal key={t.id} delay={idx * 0.04}>
              <div className="group bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/40 shadow-premium overflow-hidden hover:shadow-lg transition-all p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary ring-1 ring-primary/15 text-[0.625rem] font-bold uppercase tracking-widest">
                    {t.category}
                  </span>
                  <span className="text-[0.625rem] font-mono text-on-surface-variant/40">
                    {t.tags.slice(0, 2).join(" • ")}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-on-background mt-3 leading-tight">
                  {t.title}
                </h3>
                <p className="text-xs font-mono text-primary mt-1">“{t.hook}”</p>
                <p className="text-sm text-on-surface-variant mt-3 leading-relaxed line-clamp-3">
                  {t.prompt}
                </p>
                <button
                  onClick={() => handleUseTemplate(t.prompt)}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 active:scale-[0.98] transition-all self-start"
                >
                  Use Template <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Reveal>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <Filter className="w-8 h-8 text-on-surface-variant/30 mx-auto mb-3" />
              <p className="font-serif text-lg text-on-background">No templates match</p>
              <p className="text-sm text-on-surface-variant">Try a different search or category.</p>
            </div>
          )}
        </div>
      )}

      {/* Daily Hooks */}
      {tab === "hooks" && (
        <div className="space-y-4">
          {hooksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-surface-container-low animate-pulse ring-1 ring-outline-variant/30"
                />
              ))}
            </div>
          ) : hooks.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-8 h-8 text-on-surface-variant/30 mx-auto mb-3" />
              <p className="font-serif text-lg text-on-background">No hooks yet</p>
              <p className="text-sm text-on-surface-variant">
                Trending will appear here daily via rss/aiService.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hooks.map((h, idx) => (
                <Reveal key={idx} delay={idx * 0.04}>
                  <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/40 shadow-premium p-6 flex flex-col">
                    <div className="flex items-center gap-2 text-[0.625rem] font-mono uppercase tracking-widest text-on-surface-variant/50">
                      <TrendingUp className="w-3 h-3" /> {h.source} • {h.title.slice(0, 32)}
                    </div>
                    <p className="text-sm text-on-background mt-3 leading-relaxed whitespace-pre-line line-clamp-4">
                      {h.post}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleUseTemplate(h.post)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" /> Use as template
                      </button>
                      <button
                        onClick={() => handleCopyHook(`hook-${idx}`, h.post)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white ring-1 ring-outline-variant/30 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
                      >
                        {copied === `hook-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}{" "}
                        Copy
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          <p className="text-center kicker">Daily hooks via rss/aiService — refreshed every 24h</p>
        </div>
      )}
    </div>
  );
}

// Local icons for copy check
