"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  Check,
  ChevronDown,
  Dna,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  addPost,
  clearAllPosts,
  getEngineStats,
  getPosts,
  getTierLabel,
  getTrainedDna,
  hasTrainedDna,
  MAX_POSTS,
  MIN_POSTS,
  removePost,
  saveTrainedDna,
  type EngineStats,
  type StoredPost,
} from "@/lib/voice-dna/memory";
import { getActiveAIProfile } from "@/lib/apiHelper";

function strengthGradient(percent: number): string {
  if (percent >= 100) return "from-primary to-primary-container";
  if (percent >= 66) return "from-secondary to-secondary-container";
  if (percent >= 33) return "from-tertiary to-tertiary-container";
  return "from-on-surface-variant/40 to-on-surface-variant/60";
}

export default function DnaTrainer() {
  const [posts, setPosts] = useState<StoredPost[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainError, setTrainError] = useState<string | null>(null);
  const [trainedInfo, setTrainedInfo] = useState<{ trainedAt: string; postCount: number } | null>(
    null
  );

  const refresh = useCallback(() => {
    setPosts(getPosts());
    const record = getTrainedDna();
    if (record) setTrainedInfo({ trainedAt: record.trainedAt, postCount: record.postCount });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats: EngineStats = useMemo(() => getEngineStats(posts), [posts]);
  const canTrain = stats.totalPosts >= MIN_POSTS;

  const handleAdd = () => {
    setError(null);
    if (!draft.trim()) return;
    const result = addPost(draft);
    if (!result.ok) {
      setError(result.error ?? "Could not add post.");
      return;
    }
    setDraft("");
    refresh();
  };

  const handleTrain = async () => {
    setTrainError(null);
    const profile = getActiveAIProfile();
    if (!profile || !profile.apiKey || profile.apiKey === "REDACTED_LOCAL_ONLY") {
      setTrainError(
        "Add an AI API key below (Identity section) first - the engine needs one training pass."
      );
      return;
    }

    setTraining(true);
    try {
      const { callUniversalAI } = await import("@/lib/ai/universalRouter");
      const allPosts = getPosts()
        .map((p) => p.content)
        .join("\n\n===\n\n");
      const { buildExtractionPrompt, VOICE_EXTRACTION_SYSTEM_PROMPT } =
        await import("@/lib/ai/voiceDna/extractorPrompt");

      const response = await callUniversalAI(profile, {
        messages: [
          { role: "system", content: VOICE_EXTRACTION_SYSTEM_PROMPT },
          { role: "user", content: buildExtractionPrompt(getPosts().map((p) => p.content)) },
        ],
        temperature: 0.3,
        maxTokens: 1200,
      });

      let raw = response.text.trim();
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("AI returned no JSON block");
      const dna = JSON.parse(raw.slice(start, end + 1));

      saveTrainedDna(dna);
      refresh();
    } catch (err) {
      console.error("DNA training failed:", err);
      setTrainError(
        err instanceof Error ? err.message : "Training failed - check your API key and try again."
      );
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-[16px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 py-5 border-b border-[rgba(229,226,218,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-on-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-background leading-tight">
                Voice DNA Engine
              </h2>
              <p className="text-xs font-medium text-on-surface-variant mt-0.5">
                Feed it your real posts. It evolves with every one you add.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[0.625rem] font-bold uppercase tracking-widest font-mono shrink-0">
            Self-Evolving
          </span>
        </div>

        {/* Strength meter */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono">
              Engine Memory
            </span>
            <span className="text-xs font-bold text-on-background">
              {stats.totalPosts}
              <span className="text-on-surface-variant/40"> / {MAX_POSTS} posts</span>
              <span className="ml-2 text-primary">{getTierLabel(stats.tier)}</span>
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-container overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${strengthGradient(stats.strengthPercent)} transition-all duration-500`}
              style={{ width: `${Math.max(3, stats.strengthPercent)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[0.5625rem] font-mono uppercase tracking-widest text-on-surface-variant/40">
            <span>0</span>
            <span>{MIN_POSTS} trainable</span>
            <span>20 sharp</span>
            <span>{MAX_POSTS} elite</span>
          </div>
        </div>

        {trainedInfo && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-secondary/10 border border-secondary/20">
            <Check className="w-4 h-4 text-secondary shrink-0" />
            <p className="text-xs font-semibold text-secondary">
              DNA trained on {trainedInfo.postCount} posts — every generation now injects it.
            </p>
          </div>
        )}
      </div>

      {/* Add post */}
      <div className="px-5 sm:px-6 py-5 border-b border-[rgba(229,226,218,0.35)]">
        <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
          Paste a real post you wrote
        </label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste any LinkedIn post that sounds like YOU... (min 20 words)"
          rows={4}
          maxLength={4000}
          className="w-full bg-transparent border-none focus:ring-0 text-sm font-mono resize-none p-4 rounded-[12px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.5)] focus-within:ring-primary/30 outline-none text-on-background placeholder:text-on-surface-variant/30 transition-all"
        />
        <div className="flex items-center justify-between mt-3 gap-3">
          <span className="text-[0.625rem] font-mono text-on-surface-variant/40">
            {stats.totalPosts > 0 &&
              `${stats.totalWords.toLocaleString()} words in memory · avg ${stats.avgWords}/post`}
          </span>
          <button
            onClick={handleAdd}
            disabled={!draft.trim() || stats.totalPosts >= MAX_POSTS}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-premium disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Add to Memory
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-error">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}
      </div>

      {/* Post bank */}
      {posts.length > 0 && (
        <div className="border-b border-[rgba(229,226,218,0.35)]">
          <button
            onClick={() => setShowList((v) => !v)}
            className="w-full flex items-center justify-between px-5 sm:px-6 py-3.5 hover:bg-surface-container-low transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-mono">
              Memory Bank ({posts.length})
            </span>
            <ChevronDown
              className={`w-4 h-4 text-on-surface-variant/50 transition-transform ${showList ? "rotate-180" : ""}`}
            />
          </button>
          {showList && (
            <div className="max-h-64 overflow-y-auto px-5 sm:px-6 pb-4 space-y-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group flex items-start justify-between gap-3 p-3 rounded-[10px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.4)]"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-on-background line-clamp-2">
                      {post.content}
                    </p>
                    <p className="text-[0.625rem] font-mono text-on-surface-variant/40 mt-1">
                      {post.wordCount} words · {new Date(post.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      removePost(post.id);
                      refresh();
                    }}
                    className="p-1.5 rounded-[6px] text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-colors shrink-0"
                    aria-label="Remove post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  clearAllPosts();
                  refresh();
                }}
                className="text-[0.625rem] font-bold uppercase tracking-widest font-mono text-on-surface-variant/40 hover:text-error transition-colors pt-1"
              >
                Clear all memory
              </button>
            </div>
          )}
        </div>
      )}

      {/* Train action */}
      <div className="px-5 sm:px-6 py-5">
        {!canTrain && (
          <p className="text-xs font-medium text-on-surface-variant mb-3">
            Add{" "}
            <strong className="text-on-background">
              {MIN_POSTS - stats.totalPosts} more posts
            </strong>{" "}
            to unlock training. The closer to {MAX_POSTS}, the sharper the clone.
          </p>
        )}
        <button
          onClick={handleTrain}
          disabled={!canTrain || training}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold uppercase tracking-wider shadow-premium hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-[0.99]"
        >
          {training ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Training on {stats.totalPosts} posts...
            </>
          ) : (
            <>
              <Dna className="w-4 h-4" /> Train My Voice DNA
            </>
          )}
        </button>
        {trainError && (
          <div className="mt-3 flex items-start gap-2 text-xs font-medium text-error">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {trainError}
          </div>
        )}
        {hasTrainedDna() && !training && (
          <p className="mt-3 text-center text-[0.625rem] font-mono uppercase tracking-widest text-on-surface-variant/40">
            Re-train anytime — more posts = sharper DNA
          </p>
        )}
      </div>
    </div>
  );
}
