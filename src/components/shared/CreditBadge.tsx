"use client";

import { useEffect, useState } from "react";
import { Zap, BarChart2 } from "lucide-react";
import { isLocalMode } from "@/lib/localMode";

interface UsageInfo {
  used: number;
  limit: number;
  resets_at: string;
}

interface CreditsResponse {
  plan: string;
  analyze: UsageInfo;
  generate: UsageInfo;
}

export default function CreditBadge() {
  const [data, setData] = useState<CreditsResponse | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      if (isLocalMode()) return;
      try {
        const response = await fetch("/api/credits", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const json = (await response.json()) as CreditsResponse;
        setData(json);
      } catch (error) {
        console.error("Failed to load daily limits:", error);
      }
    };

    void fetchCredits();
  }, []);

  const analyzeUsed = data?.analyze.used ?? 0;
  const analyzeLimit = data?.analyze.limit ?? 0;
  const generateUsed = data?.generate.used ?? 0;
  const generateLimit = data?.generate.limit ?? 0;

  const analyzeAtLimit = analyzeLimit > 0 && analyzeUsed >= analyzeLimit;
  const generateAtLimit = generateLimit > 0 && generateUsed >= generateLimit;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
      {/* Analyze Daily Usage */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-container-lowest rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] shadow-sm flex-1 sm:flex-none">
        <BarChart2
          className={`w-4 h-4 shrink-0 ${analyzeAtLimit ? "text-red-500" : "text-green-600"}`}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-[0.625rem] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none mb-1 font-mono">
            Analyze
          </span>
          <span
            className={`text-[0.875rem] font-bold leading-none whitespace-nowrap ${analyzeAtLimit ? "text-red-500" : "text-green-600"}`}
          >
            {analyzeUsed}/{analyzeLimit} today
          </span>
        </div>
      </div>

      {/* Generate Daily Usage */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-container-lowest rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] shadow-sm flex-1 sm:flex-none">
        <Zap
          className={`w-4 h-4 shrink-0 ${generateAtLimit ? "text-red-500 fill-red-500/20" : "text-green-600 fill-green-600/20"}`}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-[0.625rem] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none mb-1 font-mono">
            Generate
          </span>
          <span
            className={`text-[0.875rem] font-bold leading-none whitespace-nowrap ${generateAtLimit ? "text-red-500" : "text-green-600"}`}
          >
            {generateUsed}/{generateLimit} today
          </span>
        </div>
      </div>
    </div>
  );
}
