"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, User, Layers, Check, Sparkles } from "lucide-react";
import DnaTrainer from "@/components/voice-dna/DnaTrainer";
import { DnaTuner } from "@/components/voice-dna/DnaTuner";
import { AIConfigCard } from "@/components/settings/AIConfigCard";
import FailoverToggle from "@/components/settings/FailoverToggle";
import { getPersona, savePersona, DEFAULT_PERSONA, type CreatorPersona } from "@/lib/localStore";
import { getVoiceDNA, saveVoiceDNA } from "@/lib/voice-dna/memory";
import type { VoiceDNA } from "@/lib/ai/voiceDna/types";
import PageHeader from "@/components/premium/PageHeader";
import Panel from "@/components/premium/Panel";
import Reveal from "@/components/motion/Reveal";

const TABS = [
  { id: "dna", label: "Voice DNA", icon: BrainCircuit },
  { id: "persona", label: "Persona", icon: User },
  { id: "providers", label: "AI Providers", icon: Layers },
] as const;

type TabId = (typeof TABS)[number]["id"];

function PersonaCard() {
  const [persona, setPersona] = useState<CreatorPersona>(DEFAULT_PERSONA);
  const [saved, setSaved] = useState(false);

  const save = () => {
    savePersona(persona);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Panel
      icon={User}
      eyebrow="Creator persona"
      title="Who you are on the page"
      subtitle="Injected into every generation for context-aware output"
    >
      <div className="space-y-4">
        {(
          [
            ["role", "Role"],
            ["tone", "Tone"],
            ["goal", "Goal"],
            ["audience", "Audience"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="kicker block mb-2">{label}</label>
            <input
              value={persona[key]}
              onChange={(e) => setPersona({ ...persona, [key]: e.target.value })}
              className="w-full rounded-lg bg-surface-container-low ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-3.5 py-2.5 text-sm text-on-background outline-none transition-all"
            />
          </div>
        ))}
        <button
          onClick={save}
          className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-premium"
        >
          {saved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {saved ? "Saved" : "Save persona"}
        </button>
      </div>
    </Panel>
  );
}

function TunerSection() {
  const [dna, setDna] = useState<VoiceDNA | null>(null);
  const [savedTick, setSavedTick] = useState(0);

  useEffect(() => {
    setDna(getVoiceDNA());
  }, [savedTick]);

  useEffect(() => {
    // Event-driven (storage + same-tab custom event + refocus) — no 1s polling.
    // The DnaTuner save path dispatches `lunvo:dna-updated` (see create/page).
    const refresh = () => {
      const fresh = getVoiceDNA();
      // if dna was null and now we have one (trained), show tuner
      if (fresh) setDna(fresh);
    };
    const onStorage = () => setDna(getVoiceDNA());
    window.addEventListener("storage", onStorage);
    window.addEventListener("lunvo:dna-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("lunvo:dna-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!dna) return null;

  return (
    <div className="space-y-3">
      <DnaTuner
        initialDna={dna}
        onSave={(next) => {
          saveVoiceDNA(next);
          setSavedTick((v) => v + 1);
        }}
      />
      <p className="text-center text-[0.625rem] font-mono uppercase tracking-widest text-secondary">
        Saved — next generation will use this tone
      </p>
    </div>
  );
}

export default function StudioPage() {
  const [tab, setTab] = useState<TabId>("dna");

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <PageHeader
        kicker="Studio Engine"
        title={
          <>
            The <em className="italic">AI Studio.</em>
          </>
        }
        description="Voice DNA, Persona, and AI Providers — everything that shapes how your words sound, in one place."
      />

      <Reveal delay={0.05}>
        <div className="flex items-end gap-7 border-b border-outline-variant/40">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative pb-3.5 text-sm font-semibold flex items-center gap-2 transition-colors ${
                  tab === t.id
                    ? "text-on-background"
                    : "text-on-surface-variant/70 hover:text-on-background"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {tab === t.id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </Reveal>

      <div className="min-h-[300px]">
        {tab === "dna" && (
          <Reveal key="dna" delay={0.05}>
            <div className="space-y-5">
              <DnaTrainer />
              <TunerSection />
              <FailoverToggle />
            </div>
          </Reveal>
        )}
        {tab === "persona" && (
          <Reveal key="persona" delay={0.05}>
            <PersonaCard />
          </Reveal>
        )}
        {tab === "providers" && (
          <Reveal key="providers" delay={0.05}>
            <AIConfigCard />
          </Reveal>
        )}
      </div>
    </div>
  );
}
