"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, Sparkles, ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/premium/PageHeader";
import Panel from "@/components/premium/Panel";
import Reveal from "@/components/motion/Reveal";

const inputClasses =
  "w-full rounded-lg bg-surface-container-low ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-3.5 py-2.5 text-sm text-on-background outline-none transition-all placeholder:text-on-surface-variant/35";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("Local Commander");
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lunvo_user_name");
      if (stored) setFullName(stored);
    } catch {
      // storage unavailable
    }
  }, []);

  const saveName = () => {
    try {
      localStorage.setItem("lunvo_user_name", fullName.trim() || "Local Commander");
    } catch {
      // storage unavailable
    }
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <PageHeader
        kicker="Studio Settings"
        title={
          <>
            The <em className="italic">preferences.</em>
          </>
        }
        description={
          <>
            Voice DNA, Persona, and AI Providers live in the{" "}
            <Link href="/dashboard/studio" className="text-primary font-semibold hover:underline">
              AI Studio
            </Link>
            .
          </>
        }
      />

      <Reveal delay={0.05}>
        <Panel
          icon={Sparkles}
          eyebrow="Identity"
          title="Studio name"
          subtitle="How the studio greets you"
        >
          <div className="flex gap-2.5">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClasses}
            />
            <button
              onClick={saveName}
              className="shrink-0 px-5 py-2.5 rounded-lg ring-1 ring-primary/25 bg-primary/[0.07] text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/15 transition-colors"
            >
              {nameSaved ? "Saved" : "Save"}
            </button>
          </div>
        </Panel>
      </Reveal>

      <Reveal delay={0.1}>
        <Panel
          icon={KeyRound}
          eyebrow="Providers"
          title="AI Providers moved"
          subtitle="Configure your keys in AI Studio — same vault, better UX"
        >
          <p className="text-sm text-on-surface-variant leading-relaxed">
            All AI provider keys now live in{" "}
            <Link href="/dashboard/studio" className="text-primary font-semibold hover:underline">
              Studio → Providers
            </Link>{" "}
            (vault with failover). News APIs →{" "}
            <Link href="/dashboard/news" className="text-primary font-semibold hover:underline">
              News
            </Link>
            , social →{" "}
            <Link
              href="/dashboard/distribution"
              className="text-primary font-semibold hover:underline"
            >
              Distribute
            </Link>
            .
          </p>
        </Panel>
      </Reveal>

      <Reveal delay={0.15}>
        <p className="text-center kicker pt-2 flex items-center justify-center gap-1.5">
          Everything stays on this device
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-0.5 text-primary hover:underline normal-case tracking-normal"
          >
            back to mission control <ArrowUpRight className="w-3 h-3" />
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
