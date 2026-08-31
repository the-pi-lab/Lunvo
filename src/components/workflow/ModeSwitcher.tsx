"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, GitFork } from "lucide-react";

export function ModeSwitcher() {
  const pathname = usePathname();
  const isWorkflow = pathname.startsWith("/dashboard/workflow");

  return (
    <div className="inline-flex items-center p-1 bg-surface-container/70 backdrop-blur-md rounded-2xl border border-outline-variant/50 shadow-inner">
      <Link
        href="/dashboard/create"
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
          !isWorkflow
            ? "bg-white text-primary shadow-sm shadow-black/5"
            : "text-on-surface-variant hover:text-on-background"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Simple Studio</span>
      </Link>
      <Link
        href="/dashboard/workflow"
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
          isWorkflow
            ? "bg-primary text-white shadow-sm shadow-primary/20"
            : "text-on-surface-variant hover:text-on-background"
        }`}
      >
        <GitFork className="w-3.5 h-3.5" />
        <span>Node Builder</span>
        <span className="px-1.5 py-0.2 text-[10px] bg-amber-400 text-amber-950 font-black rounded-full uppercase tracking-wider">
          v2
        </span>
      </Link>
    </div>
  );
}
