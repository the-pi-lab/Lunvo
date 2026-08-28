"use client";

import { useEffect, useState } from "react";
import { Zap, Check } from "lucide-react";
import { isFailoverEnabled, setFailoverEnabled } from "@/lib/failoverPref";

export default function FailoverToggle() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnabled(isFailoverEnabled());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setFailoverEnabled(next);
  };

  if (!mounted) return <div className="h-[72px]" />;

  return (
    <div className="glass rounded-[16px] !border-transparent p-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${
            enabled ? "bg-secondary/10 text-secondary" : "bg-zinc-100 text-zinc-400"
          }`}
        >
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900 leading-tight">Auto-Failover</h2>
          <p className="text-xs text-zinc-500">
            {enabled
              ? "One key hits limit → next takes over instantly."
              : "Disabled — only your active provider will be used."}
          </p>
        </div>
      </div>

      {/* Toggle switch */}
      <button
        onClick={toggle}
        role="switch"
        aria-checked={enabled}
        className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300 shrink-0 ${
          enabled ? "bg-secondary" : "bg-zinc-300"
        }`}
        style={{ width: 52 }}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
            enabled ? "translate-x-[28px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
