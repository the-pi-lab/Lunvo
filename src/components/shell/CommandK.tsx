"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Settings } from "lucide-react";
import { NAV_ITEMS } from "./nav-config";

interface CommandKProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface CmdItem {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

export default function CommandK({ open, onClose, onLogout }: CommandKProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<CmdItem[]>(() => {
    const navItems: CmdItem[] = NAV_ITEMS.map((item) => ({
      id: `nav-${item.href}`,
      label: item.label,
      hint: "Page",
      icon: item.icon,
      run: () => router.push(item.href),
    }));

    const settingsItem: CmdItem = {
      id: "nav-settings",
      label: "Settings",
      hint: "Page",
      icon: Settings,
      run: () => router.push("/dashboard/settings"),
    };

    const actions: CmdItem[] = [];

    return [...navItems, settingsItem, ...actions];
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const runItem = (item: CmdItem | undefined) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runItem(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.button
            aria-label="Close command palette overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-1/2 top-[16vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-[16px] bg-surface-container-lowest shadow-premium ring-1 ring-[rgba(229,226,218,0.5)] dark:ring-white/10"
          >
            <div className="flex items-center gap-3 border-b border-[rgba(229,226,218,0.35)] px-4">
              <Search className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages and actions..."
                className="w-full bg-transparent py-3.5 text-sm font-medium text-on-background placeholder:text-on-surface-variant/40 outline-none"
              />
              <kbd className="rounded-md bg-surface-container px-1.5 py-0.5 font-mono text-[0.625rem] font-bold text-on-surface-variant/70">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="py-10 text-center text-sm font-medium text-on-surface-variant/60">
                  No results for &ldquo;{query}&rdquo;
                </p>
              ) : (
                filtered.map((item, index) => {
                  const Icon = item.icon;
                  const active = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      data-index={index}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runItem(item)}
                      className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                        active ? "bg-primary/10 text-primary" : "text-on-background"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${active ? "text-primary" : "text-on-surface-variant/70"}`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.hint && (
                        <span className="rounded-md bg-surface-container px-1.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/60">
                          {item.hint}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-[rgba(229,226,218,0.35)] px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono">
                <kbd className="rounded bg-surface-container px-1">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono">
                <kbd className="rounded bg-surface-container px-1">↵</kbd> Select
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono">
                <kbd className="rounded bg-surface-container px-1">Ctrl</kbd>
                <kbd className="rounded bg-surface-container px-1">K</kbd>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
