"use client";

import { useState, useEffect } from "react";
import { VoiceDNA } from "@/lib/ai/voiceDna/types";
import { Save, Download, Upload, Sparkles, Wand2, Check } from "lucide-react";
import { getPosts } from "@/lib/voice-dna/memory";
import { isPostValidForExtraction } from "@/lib/ai/voiceDna/ingestor";
import {
  VOICE_EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
} from "@/lib/ai/voiceDna/extractorPrompt";
import { getActiveAIProfile } from "@/lib/apiHelper";

interface DnaTunerProps {
  initialDna: VoiceDNA;
  onSave: (dna: VoiceDNA) => void;
}

// Map sliders 0-100 to DNA fields
function slidersToDna(
  base: VoiceDNA,
  sliders: { clarity: number; brevity: number; expressiveness: number; structure: number }
): VoiceDNA {
  const clarity = sliders.clarity;
  const brevity = sliders.brevity;
  const express = sliders.expressiveness;
  const struct = sliders.structure;

  const sentence_structure: VoiceDNA["sentence_structure"] =
    clarity < 33 ? "simple" : clarity > 66 ? "complex" : "mixed";

  const paragraph_length: VoiceDNA["formatting_preferences"]["paragraph_length"] =
    brevity < 33 ? "short" : brevity < 66 ? "medium" : brevity < 85 ? "long" : "mixed";

  const emoji_frequency: VoiceDNA["formatting_preferences"]["emoji_frequency"] =
    express < 33 ? "none" : express < 66 ? "low" : "high";

  const uses_bullet_points = struct > 50;

  return {
    ...base,
    sentence_structure,
    formatting_preferences: {
      ...base.formatting_preferences,
      paragraph_length,
      emoji_frequency,
      uses_bullet_points,
    },
  };
}

function dnaToSliders(dna: VoiceDNA): {
  clarity: number;
  brevity: number;
  expressiveness: number;
  structure: number;
} {
  const clarityMap: Record<string, number> = { simple: 15, mixed: 50, complex: 85 };
  const brevityMap: Record<string, number> = { short: 15, medium: 50, long: 80, mixed: 95 };
  const expressMap: Record<string, number> = { none: 15, low: 50, high: 85 };
  return {
    clarity: clarityMap[dna.sentence_structure] ?? 50,
    brevity: brevityMap[dna.formatting_preferences.paragraph_length] ?? 50,
    expressiveness: expressMap[dna.formatting_preferences.emoji_frequency] ?? 50,
    structure: dna.formatting_preferences.uses_bullet_points ? 75 : 25,
  };
}

export function DnaTuner({ initialDna, onSave }: DnaTunerProps) {
  const [dna, setDna] = useState<VoiceDNA>(initialDna);
  const [sliders, setSliders] = useState(() => dnaToSliders(initialDna));
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [autoFilling, setAutoFilling] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    setDna(initialDna);
    setSliders(dnaToSliders(initialDna));
  }, [initialDna]);

  const updateSlider = (key: keyof typeof sliders, value: number) => {
    const next = { ...sliders, [key]: value };
    setSliders(next);
    setDna(slidersToDna(dna, next));
  };

  const handleSave = () => {
    setIsSaving(true);
    onSave({ ...dna, last_updated: new Date().toISOString() });
    setToast("Saved — preview regenerated");
    setPreviewKey((k) => k + 1);
    setTimeout(() => {
      setIsSaving(false);
      setToast(null);
    }, 1800);
  };

  const handleAutoFill = async () => {
    const posts = getPosts();
    if (posts.length === 0) {
      setToast("Add posts to memory first");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    // Validate via ingestor
    const valid = posts.filter((p) => isPostValidForExtraction(p.content).valid);
    if (valid.length === 0) {
      setToast("No valid posts (min 20 words) for extraction");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    const profile = getActiveAIProfile();
    if (!profile || !profile.apiKey || profile.apiKey === "REDACTED_LOCAL_ONLY") {
      setToast("Add AI key in Studio → Providers to auto-fill");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    setAutoFilling(true);
    try {
      const { unifiedAI } = await import("@/lib/ai/router.unified");
      const { parseAIJson } = await import("@/lib/ai/router");
      const contents = valid.slice(0, 8).map((p) => p.content);
      const res = await unifiedAI({
        profile,
        messages: [
          { role: "system", content: VOICE_EXTRACTION_SYSTEM_PROMPT },
          { role: "user", content: buildExtractionPrompt(contents) },
        ],
        temperature: 0.3,
        maxTokens: 1200,
      });
      const parsed = parseAIJson<Record<string, unknown>>(res.text);
      // Merge into current dna
      const next: VoiceDNA = {
        ...dna,
        tone: (parsed["tone"] as string[]) ?? dna.tone,
        formatting_preferences:
          (parsed["formatting_preferences"] as VoiceDNA["formatting_preferences"]) ??
          dna.formatting_preferences,
        vocabulary: (parsed["vocabulary"] as VoiceDNA["vocabulary"]) ?? dna.vocabulary,
        sentence_structure:
          (parsed["sentence_structure"] as VoiceDNA["sentence_structure"]) ??
          dna.sentence_structure,
        last_updated: new Date().toISOString(),
      };
      setDna(next);
      setSliders(dnaToSliders(next));
      setToast("Auto-filled from memory");
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      setToast(e instanceof Error ? e.message.slice(0, 80) : "Auto-fill failed");
      setTimeout(() => setToast(null), 2000);
    } finally {
      setAutoFilling(false);
    }
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dna, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "my_voice_dna.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as VoiceDNA;
        // Validate shape minimally
        if (!imported.tone || !imported.formatting_preferences) throw new Error("Invalid");
        setDna(imported);
        setSliders(dnaToSliders(imported));
        setToast("Imported — review and Save");
        setTimeout(() => setToast(null), 2000);
      } catch {
        setToast("Invalid JSON file");
        setTimeout(() => setToast(null), 2000);
      }
    };
    reader.readAsText(file);
  };

  const samplePreview = (() => {
    const tone = dna.tone.slice(0, 2).join(", ") || "clear";
    const bullets = dna.formatting_preferences.uses_bullet_points
      ? "• Point one\n• Point two"
      : "Paragraph one. Paragraph two.";
    const emoji =
      dna.formatting_preferences.emoji_frequency === "high"
        ? " 🚀"
        : dna.formatting_preferences.emoji_frequency === "low"
          ? " ✨"
          : "";
    return `Tone: ${tone} — ${dna.sentence_structure} sentences, ${dna.formatting_preferences.paragraph_length} paras${emoji}\n${bullets}`;
  })();

  return (
    <div className="bg-surface-container-lowest ring-1 ring-[rgba(229,226,218,0.5)] rounded-xl p-6 relative">
      {/* Toast */}
      {toast && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold shadow-premium flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" /> {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-on-background flex items-center gap-2">
            Voice DNA Tuner{" "}
            <span className="text-[0.625rem] font-mono uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              V2
            </span>
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Fine-tune with sliders. Auto-fill from your memory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoFill}
            disabled={autoFilling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Wand2 className={`w-3.5 h-3.5 ${autoFilling ? "animate-pulse" : ""}`} />
            {autoFilling ? "Filling..." : "Auto-fill"}
          </button>
          <label className="cursor-pointer p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-primary">
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            <Upload className="w-4 h-4" />
          </label>
          <button
            onClick={handleExport}
            className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-primary"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="flex items-center justify-between text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
            <span>Clarity — {dna.sentence_structure}</span>
            <span className="text-primary">{sliders.clarity}</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={sliders.clarity}
            onChange={(e) => updateSlider("clarity", Number(e.target.value))}
            className="w-full accent-primary h-1"
          />
          <div className="flex justify-between text-[0.5625rem] font-mono text-on-surface-variant/40 mt-1">
            <span>Simple</span>
            <span>Mixed</span>
            <span>Complex</span>
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
            <span>Brevity — {dna.formatting_preferences.paragraph_length}</span>
            <span className="text-primary">{sliders.brevity}</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={sliders.brevity}
            onChange={(e) => updateSlider("brevity", Number(e.target.value))}
            className="w-full accent-primary h-1"
          />
          <div className="flex justify-between text-[0.5625rem] font-mono text-on-surface-variant/40 mt-1">
            <span>Short</span>
            <span>Medium</span>
            <span>Long</span>
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
            <span>Expressiveness — {dna.formatting_preferences.emoji_frequency}</span>
            <span className="text-primary">{sliders.expressiveness}</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={sliders.expressiveness}
            onChange={(e) => updateSlider("expressiveness", Number(e.target.value))}
            className="w-full accent-primary h-1"
          />
          <div className="flex justify-between text-[0.5625rem] font-mono text-on-surface-variant/40 mt-1">
            <span>None</span>
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
            <span>
              Structure — {dna.formatting_preferences.uses_bullet_points ? "Bullets" : "Prose"}
            </span>
            <span className="text-primary">{sliders.structure}</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={sliders.structure}
            onChange={(e) => updateSlider("structure", Number(e.target.value))}
            className="w-full accent-primary h-1"
          />
          <div className="flex justify-between text-[0.5625rem] font-mono text-on-surface-variant/40 mt-1">
            <span>Prose</span>
            <span>Bullets</span>
          </div>
        </div>
      </div>

      {/* Existing fields (kept for completeness) */}
      <div className="space-y-4">
        <div>
          <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
            Tone Adjectives (comma separated)
          </label>
          <input
            type="text"
            value={dna.tone.join(", ")}
            onChange={(e) =>
              setDna({
                ...dna,
                tone: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-[8px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.5)] px-3 py-2 text-sm text-on-background"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
              Commonly Used Words
            </label>
            <input
              type="text"
              value={dna.vocabulary.commonly_used_words.join(", ")}
              onChange={(e) =>
                setDna({
                  ...dna,
                  vocabulary: {
                    ...dna.vocabulary,
                    commonly_used_words: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
              className="w-full rounded-[8px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.5)] px-3 py-2 text-sm text-on-background"
            />
          </div>
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2 text-red-600">
              Banned Words
            </label>
            <input
              type="text"
              value={dna.vocabulary.banned_words.join(", ")}
              onChange={(e) =>
                setDna({
                  ...dna,
                  vocabulary: {
                    ...dna.vocabulary,
                    banned_words: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
              className="w-full rounded-md border border-red-300 bg-red-50/50 px-3 py-2 text-sm text-on-background"
            />
          </div>
        </div>
      </div>

      {/* Preview regen */}
      <div
        key={previewKey}
        className="mt-6 p-4 rounded-[12px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.4)]"
      >
        <div className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-primary" /> Live preview (regen on Save)
        </div>
        <p className="text-sm text-on-background whitespace-pre-wrap font-mono leading-relaxed">
          {samplePreview}
        </p>
      </div>

      <div className="pt-4 flex justify-end border-t border-[rgba(229,226,218,0.35)] mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving..." : "Save DNA Profile"}</span>
        </button>
      </div>
    </div>
  );
}
