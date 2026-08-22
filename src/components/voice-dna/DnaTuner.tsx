"use client";

import { useState } from "react";
import { VoiceDNA } from "@/lib/ai/voiceDna/types";
import { Save, Download, Upload } from "lucide-react";

interface DnaTunerProps {
  initialDna: VoiceDNA;
  onSave: (dna: VoiceDNA) => void;
}

export function DnaTuner({ initialDna, onSave }: DnaTunerProps) {
  const [dna, setDna] = useState<VoiceDNA>(initialDna);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    onSave(dna);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dna, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "my_voice_dna.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string) as VoiceDNA;
          setDna(imported);
        } catch (error) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-surface-container-lowest ring-1 ring-[rgba(229,226,218,0.5)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-on-background">Voice DNA Tuner</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Manually fine-tune the extracted linguistic profile.
          </p>
        </div>
        <div className="flex items-center space-x-2">
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

      <div className="space-y-6">
        <div>
          <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
            Tone Adjectives (Comma separated)
          </label>
          <input
            type="text"
            value={dna.tone.join(", ")}
            onChange={(e) =>
              setDna({ ...dna, tone: e.target.value.split(",").map((s) => s.trim()) })
            }
            className="w-full rounded-[8px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.5)] px-3 py-2 text-sm text-on-background "
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
              Sentence Structure
            </label>
            <select
              value={dna.sentence_structure}
              onChange={(e) => setDna({ ...dna, sentence_structure: e.target.value as any })}
              className="w-full rounded-[8px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.5)] px-3 py-2 text-sm text-on-background "
            >
              <option value="simple">Simple & Direct</option>
              <option value="complex">Complex & Descriptive</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
              Paragraph Length
            </label>
            <select
              value={dna.formatting_preferences.paragraph_length}
              onChange={(e) =>
                setDna({
                  ...dna,
                  formatting_preferences: {
                    ...dna.formatting_preferences,
                    paragraph_length: e.target.value as any,
                  },
                })
              }
              className="w-full rounded-[8px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.5)] px-3 py-2 text-sm text-on-background "
            >
              <option value="short">Short (1-2 lines)</option>
              <option value="medium">Medium (3-4 lines)</option>
              <option value="long">Long (Broetry)</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
              Emoji Frequency
            </label>
            <select
              value={dna.formatting_preferences.emoji_frequency}
              onChange={(e) =>
                setDna({
                  ...dna,
                  formatting_preferences: {
                    ...dna.formatting_preferences,
                    emoji_frequency: e.target.value as any,
                  },
                })
              }
              className="w-full rounded-[8px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.5)] px-3 py-2 text-sm text-on-background "
            >
              <option value="none">None</option>
              <option value="low">Low (1-2 per post)</option>
              <option value="high">High (Many emojis)</option>
            </select>
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="bullets"
              checked={dna.formatting_preferences.uses_bullet_points}
              onChange={(e) =>
                setDna({
                  ...dna,
                  formatting_preferences: {
                    ...dna.formatting_preferences,
                    uses_bullet_points: e.target.checked,
                  },
                })
              }
              className="rounded border-[rgba(229,226,218,0.6)] text-primary focus:ring-primary/40"
            />
            <label htmlFor="bullets" className="ml-2 block text-sm text-on-background ">
              Prefers Bullet Points / Lists
            </label>
          </div>
        </div>

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
                  commonly_used_words: e.target.value.split(",").map((s) => s.trim()),
                },
              })
            }
            className="w-full rounded-[8px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.5)] px-3 py-2 text-sm text-on-background "
          />
        </div>

        <div>
          <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2 text-red-600 dark:text-red-400">
            Banned Words (Jargon to avoid)
          </label>
          <input
            type="text"
            value={dna.vocabulary.banned_words.join(", ")}
            onChange={(e) =>
              setDna({
                ...dna,
                vocabulary: {
                  ...dna.vocabulary,
                  banned_words: e.target.value.split(",").map((s) => s.trim()),
                },
              })
            }
            className="w-full rounded-md border border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20 px-3 py-2 text-sm text-slate-900 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div className="pt-4 flex justify-end border-t border-[rgba(229,226,218,0.35)] ">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save DNA Profile"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
