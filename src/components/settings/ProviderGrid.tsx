"use client";

import { useMemo, useState } from "react";
import { Search, Lock, Sparkles } from "lucide-react";
import {
  PROVIDER_REGISTRY,
  searchProviders,
  CATEGORY_META,
  type ProviderDef,
  type ProviderCategory,
} from "@/lib/ai/providers/registry";

function ProviderLogo({ def, size = 36 }: { def: ProviderDef; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (def.iconSlug && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://cdn.simpleicons.org/${def.iconSlug}/${def.color.replace("#", "")}`}
        alt={def.name}
        width={size}
        height={size}
        className="rounded-[8px] object-contain bg-surface-container-low"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-[8px] font-bold text-white shrink-0"
      style={{ width: size, height: size, backgroundColor: def.color, fontSize: size * 0.45 }}
    >
      {def.name.charAt(0)}
    </div>
  );
}

interface ProviderGridProps {
  selectedId: string | null;
  onSelect: (def: ProviderDef) => void;
  compact?: boolean;
}

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as ProviderCategory[];

export default function ProviderGrid({ selectedId, onSelect, compact = false }: ProviderGridProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProviderCategory | "all">("all");

  const filtered = useMemo(() => {
    let list = searchProviders(query);
    if (category !== "all") list = list.filter((p) => p.category === category);
    return list;
  }, [query, category]);

  const grouped = useMemo(() => {
    const map = new Map<ProviderCategory, ProviderDef[]>();
    for (const p of filtered) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${PROVIDER_REGISTRY.length} providers...`}
          className="w-full rounded-[10px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.5)] focus-within:ring-primary/30 pl-9 pr-3 py-2.5 text-sm text-on-background placeholder:text-on-surface-variant/40 outline-none transition-all"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory("all")}
          className={`px-3 py-1.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider transition-colors ${
            category === "all"
              ? "bg-primary text-on-primary"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          All ({PROVIDER_REGISTRY.length})
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const count = PROVIDER_REGISTRY.filter((p) => p.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider transition-colors ${
                category === cat
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {CATEGORY_META[cat].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid grouped by category */}
      <div
        className={`space-y-4 ${compact ? "max-h-[340px]" : "max-h-[440px]"} overflow-y-auto pr-1`}
      >
        {grouped.length === 0 && (
          <p className="text-center text-sm text-on-surface-variant/60 py-8">
            No providers match &ldquo;{query}&rdquo; — try a different search.
          </p>
        )}
        {grouped.map(([cat, providers]) => (
          <div key={cat}>
            <p
              className="text-[0.5625rem] font-bold uppercase tracking-widest font-mono mb-2"
              style={{ color: CATEGORY_META[cat].color }}
            >
              {CATEGORY_META[cat].label}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {providers.map((def) => {
                const selected = selectedId === def.id;
                return (
                  <button
                    key={def.id}
                    onClick={() => !def.coming && onSelect(def)}
                    disabled={def.coming}
                    className={`relative flex items-center gap-2.5 p-3 rounded-[12px] text-left transition-all ring-1 ${
                      selected
                        ? "bg-primary/10 ring-primary shadow-sm"
                        : def.coming
                          ? "bg-surface-container/50 ring-[rgba(229,226,218,0.3)] opacity-60 cursor-not-allowed"
                          : "bg-surface-container-lowest ring-[rgba(229,226,218,0.5)] hover:ring-primary/40 hover:shadow-sm"
                    }`}
                  >
                    <ProviderLogo def={def} size={32} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-bold truncate ${selected ? "text-primary" : "text-on-background"}`}
                      >
                        {def.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {def.freeTier && (
                          <span className="inline-flex items-center gap-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-secondary">
                            <Sparkles className="w-2.5 h-2.5" /> Free
                          </span>
                        )}
                        {def.local && (
                          <span className="text-[0.5625rem] font-bold uppercase tracking-wide text-on-surface-variant/60">
                            Offline
                          </span>
                        )}
                        {def.coming && (
                          <span className="inline-flex items-center gap-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-tertiary">
                            <Lock className="w-2.5 h-2.5" /> Coming
                          </span>
                        )}
                      </div>
                    </div>
                    {selected && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary ring-2 ring-background" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
