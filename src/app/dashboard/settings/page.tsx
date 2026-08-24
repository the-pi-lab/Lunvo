"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, KeyRound, Check, Sparkles } from "lucide-react";
import DnaTrainer from "@/components/voice-dna/DnaTrainer";
import { AIConfigCard } from "@/components/settings/AIConfigCard";
import { getPersona, savePersona, DEFAULT_PERSONA, type CreatorPersona } from "@/lib/localStore";

function SettingsCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-[16px] !border-transparent p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-[8px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-on-background leading-tight">{title}</h2>
          <p className="text-xs text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [fullName, setFullName] = useState("Local Commander");
  const [nameSaved, setNameSaved] = useState(false);
  const [persona, setPersona] = useState<CreatorPersona>(DEFAULT_PERSONA);
  const [personaSaved, setPersonaSaved] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [keysSaved, setKeysSaved] = useState(false);

  useEffect(() => {
    setPersona(getPersona());
    const g = localStorage.getItem("lunvo_gemini_key");
    const q = localStorage.getItem("lunvo_groq_key");
    if (g) setGeminiKey(g);
    if (q) setGroqKey(q);
  }, []);

  const saveName = () => {
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const savePersonaLocal = () => {
    savePersona(persona);
    setPersonaSaved(true);
    setTimeout(() => setPersonaSaved(false), 2000);
  };

  const saveKeys = () => {
    localStorage.setItem("lunvo_gemini_key", geminiKey.trim());
    localStorage.setItem("lunvo_groq_key", groqKey.trim());
    setKeysSaved(true);
    setTimeout(() => setKeysSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pt-2">
        <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-2">
          Studio Settings
        </p>
        <h1 className="text-4xl font-serif text-on-background">Settings</h1>
      </div>

      {/* Voice DNA Engine */}
      <DnaTrainer />

      {/* Creator Persona */}
      <SettingsCard
        icon={<User className="w-4 h-4" />}
        title="Creator Persona"
        subtitle="Injected into every generation for context-aware output"
      >
        <div className="space-y-3">
          {(
            [
              ["role", "Role"],
              ["tone", "Tone"],
              ["goal", "Goal"],
              ["audience", "Audience"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-1.5">
                {label}
              </label>
              <input
                value={persona[key]}
                onChange={(e) => setPersona({ ...persona, [key]: e.target.value })}
                className="w-full rounded-[8px] bg-surface-container-lowest ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-3 py-2 text-sm text-on-background outline-none transition-all"
              />
            </div>
          ))}
          <button
            onClick={savePersonaLocal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-premium transition-all active:scale-[0.98]"
          >
            {personaSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {personaSaved ? "Saved" : "Save Persona"}
          </button>
        </div>
      </SettingsCard>

      {/* AI Providers */}
      <AIConfigCard />

      {/* Legacy platform keys (optional server-side fallback) */}
      <SettingsCard
        icon={<KeyRound className="w-4 h-4" />}
        title="Platform Keys (Optional)"
        subtitle="Used by server-side features like trending posts"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-1.5">
              Gemini Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full rounded-[8px] bg-surface-container-lowest ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-3 py-2 text-sm font-mono text-on-background placeholder:text-on-surface-variant/40 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-1.5">
              Groq Key
            </label>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full rounded-[8px] bg-surface-container-lowest ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-3 py-2 text-sm font-mono text-on-background placeholder:text-on-surface-variant/40 outline-none transition-all"
            />
          </div>
          <button
            onClick={saveKeys}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-premium transition-all active:scale-[0.98]"
          >
            {keysSaved ? <Check className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
            {keysSaved ? "Saved" : "Save Keys"}
          </button>
        </div>
      </SettingsCard>

      {/* Display name (local) */}
      <SettingsCard
        icon={<Sparkles className="w-4 h-4" />}
        title="Studio Name"
        subtitle="How the studio greets you"
      >
        <div className="flex gap-2">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="flex-1 rounded-[8px] bg-surface-container-lowest ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-3 py-2 text-sm text-on-background outline-none transition-all"
          />
          <button
            onClick={saveName}
            className="px-4 py-2 rounded-[8px] bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
          >
            {nameSaved ? "Saved" : "Save"}
          </button>
        </div>
      </SettingsCard>

      <p className="text-center text-[0.625rem] font-mono uppercase tracking-widest text-on-surface-variant/40 pt-2">
        Everything stays on this device —{" "}
        <Link href="/dashboard" className="text-primary hover:underline">
          back to studio
        </Link>
      </p>
    </div>
  );
}
