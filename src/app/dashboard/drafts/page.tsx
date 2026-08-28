"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Trash2,
  PenTool,
  Search,
  Filter,
  CheckSquare,
  Square,
  BarChart3,
} from "lucide-react";
import { getDrafts, deleteDraft, deleteDraftsBulk, type LocalDraft } from "@/lib/localStore";
import { analyzeLocally } from "@/lib/analysis/localHeuristics";
import PageHeader from "@/components/premium/PageHeader";
import EmptyState from "@/components/premium/EmptyState";
import Reveal from "@/components/motion/Reveal";

type SourceFilter = "all" | LocalDraft["source"];

function InlineMeter({ content }: { content: string }) {
  const analysis = analyzeLocally(content);
  const score = analysis.overall_score;
  const hook = analysis.scores.hook.score;
  const color =
    score >= 7
      ? "text-emerald-600 bg-emerald-50 ring-emerald-200"
      : score >= 5
        ? "text-amber-600 bg-amber-50 ring-amber-200"
        : "text-zinc-500 bg-zinc-100 ring-zinc-200";
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[0.625rem] font-bold ring-1 ${color}`}
      >
        <BarChart3 className="w-3 h-3" />
        {score.toFixed(1)}/10
      </span>
      <span className="text-[0.625rem] font-mono text-on-surface-variant/50">Hook {hook}/10</span>
      <div className="w-16 h-1.5 rounded-full bg-surface-container overflow-hidden hidden sm:block">
        <div
          className={`h-full rounded-full ${score >= 7 ? "bg-emerald-500" : score >= 5 ? "bg-amber-500" : "bg-zinc-400"}`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<LocalDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SourceFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDrafts(getDrafts());
    setIsLoading(false);
  }, []);

  const filtered = useMemo(() => {
    const start = performance.now();
    const q = search.toLowerCase().trim();
    const result = drafts.filter((d) => {
      const matchesSearch =
        !q || d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q);
      const matchesFilter = filter === "all" || d.source === filter;
      return matchesSearch && matchesFilter;
    });
    const elapsed = performance.now() - start;
    if (elapsed > 200)
      console.warn(`Drafts filter took ${elapsed.toFixed(1)}ms for ${drafts.length} drafts`);
    return result;
  }, [drafts, search, filter]);

  const handleDelete = (id: string) => {
    deleteDraft(id);
    setDrafts(getDrafts());
    setSelected((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((d) => d.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} drafts? This cannot be undone.`)) return;
    deleteDraftsBulk(Array.from(selected));
    setDrafts(getDrafts());
    setSelected(new Set());
  };

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <PageHeader
        kicker="Archive"
        title={
          <>
            Drafts &amp; <em className="italic">history.</em>
          </>
        }
        description="Every draft you save lives here — stored locally on your machine, private by default."
      />

      <Reveal delay={0.05}>
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/40 shadow-premium overflow-hidden">
          {/* Toolbar: Search + Filter + Bulk */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-outline-variant/30 bg-surface-container-low/50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search drafts (title or content)…"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 text-sm text-on-background outline-none placeholder:text-on-surface-variant/40"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.625rem] font-mono text-on-surface-variant/30 hidden sm:inline">
                {filtered.length} / {drafts.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-full bg-white ring-1 ring-outline-variant/30">
                {(["all", "created", "analyzed", "manual"] as SourceFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${filter === f ? "bg-zinc-900 text-white shadow" : "text-on-surface-variant hover:text-on-background"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={toggleSelectAll}
                disabled={filtered.length === 0}
                className="p-2 rounded-lg bg-white ring-1 ring-outline-variant/30 text-on-surface-variant hover:text-primary disabled:opacity-40"
                title={allSelected ? "Deselect all" : "Select all"}
              >
                {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-200">
              <span className="text-sm font-semibold text-amber-900">{selected.size} selected</span>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-error text-white text-xs font-bold hover:bg-error/90 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete selected
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant shimmer rounded-2xl">
              Loading drafts...
            </div>
          ) : drafts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No drafts yet"
              body="Compose a post in the Content Factory and hit Save Draft — it lands here, stored only on your device."
              action={
                <Link
                  href="/dashboard/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary text-sm font-bold shadow-premium hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  <PenTool className="w-4 h-4" /> Open the factory
                </Link>
              }
            />
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="w-8 h-8 text-on-surface-variant/30 mx-auto mb-3" />
              <p className="font-serif text-lg text-on-background">No matches</p>
              <p className="text-sm text-on-surface-variant mt-1">
                Try a different search or filter.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/30">
              {filtered.map((draft) => (
                <li
                  key={draft.id}
                  className="group flex items-start gap-4 p-5 hover:bg-surface-container-low/60 transition-colors"
                >
                  <button
                    onClick={() => toggleSelect(draft.id)}
                    className={`mt-1 w-5 h-5 rounded-md ring-1 flex items-center justify-center shrink-0 transition-colors ${selected.has(draft.id) ? "bg-primary ring-primary text-white" : "bg-white ring-outline-variant/40 text-transparent hover:ring-primary/30"}`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-10 h-10 rounded-xl ring-1 ring-outline-variant/40 bg-surface-container-low flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-[1.05rem] text-on-background leading-snug truncate">
                      {draft.title}
                    </p>
                    <p className="text-[0.8125rem] text-on-surface-variant line-clamp-2 mt-1 whitespace-pre-line leading-relaxed">
                      {draft.content.slice(0, 160)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-mono text-on-surface-variant/50 tracking-wide">
                        <Calendar className="w-3 h-3" />
                        {new Date(draft.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/[0.07] ring-1 ring-primary/15 text-primary text-[0.5625rem] font-bold uppercase tracking-[0.14em] font-mono">
                        {draft.source}
                      </span>
                      <InlineMeter content={draft.content} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="p-2 rounded-lg text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                    aria-label="Delete draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>

      {!isLoading && drafts.length > 0 && (
        <Reveal delay={0.1}>
          <p className="text-center kicker">
            {filtered.length} of {drafts.length} shown · {selected.size} selected · synced to this
            device only
          </p>
        </Reveal>
      )}
    </div>
  );
}
