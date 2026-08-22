"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, ServerCrash } from "lucide-react";
import { AIProfile } from "@/lib/ai/types";

interface ConnectionTestButtonProps {
  profile: AIProfile;
}

export function ConnectionTestButton({ profile }: ConnectionTestButtonProps) {
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [latency, setLatency] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTest = async () => {
    if (!profile.provider || !profile.model) {
      setStatus("error");
      setErrorMessage("Please select a provider and model first.");
      return;
    }

    setStatus("testing");
    setErrorMessage(null);
    setLatency(null);

    try {
      const res = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setLatency(data.latencyMs);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to connect to provider.");
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMessage(e.message || "Network error while connecting.");
    }
  };

  return (
    <div className="mt-4 flex flex-col space-y-2">
      <button
        onClick={handleTest}
        disabled={status === "testing"}
        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all w-fit"
      >
        {status === "testing" && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === "idle" && <ServerCrash className="w-4 h-4" />}
        <span>
          {status === "testing" ? "Pinging Provider..." : "Test Connection"}
        </span>
      </button>

      {status === "success" && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start space-x-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Connection Successful!</p>
            <p className="opacity-90 mt-0.5">
              Successfully communicated with <strong>{profile.provider}</strong> in {latency}ms.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">
            <p className="font-bold font-sans text-sm mb-1">Connection Failed</p>
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}
