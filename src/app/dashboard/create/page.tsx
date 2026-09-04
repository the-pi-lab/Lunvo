"use client";

import { useState, useEffect } from "react";
import { getActiveAIProfile } from "@/lib/apiHelper";
import { runContentPipeline, PipelineProgress } from "@/lib/ai/agents/orchestrator";
import { getVoiceDNA, hasTrainedDna } from "@/lib/voice-dna/memory";
import { predictEngagementRate } from "@/lib/ai/scoringEngine";
import { setLastER, setLastHook, incrementUsage } from "@/lib/localStore";
import dynamic from "next/dynamic";
import {
  BrainCircuit,
  PenTool,
  Check,
  Search,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import PageHeader from "@/components/premium/PageHeader";
import Reveal from "@/components/motion/Reveal";

const ImageStudio = dynamic(
  () => import("@/components/create/ImageStudio").then((mod) => mod.ImageStudio),
  { ssr: false }
);

const PostEditor = dynamic(
  () => import("@/components/create/PostEditor").then((mod) => mod.PostEditor),
  { ssr: false }
);

type StepState = "waiting" | "active" | "done";

function Step({
  icon: Icon,
  index,
  title,
  desc,
  state,
  statusLabel,
}: {
  icon: typeof Search;
  index: string;
  title: string;
  desc: string;
  state: StepState;
  statusLabel: string;
}) {
  return (
    <div className="relative">
      <div
        className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-surface-container-lowest transition-colors duration-300 ${
          state === "done"
            ? "bg-secondary text-white"
            : state === "active"
              ? "bg-primary text-white animate-pulse"
              : "bg-surface-container-high text-on-surface-variant/60"
        }`}
      >
        {state === "done" ? (
          <Check className="w-3 h-3" />
        ) : (
          <Icon className="w-3 h-3" strokeWidth={2} />
        )}
      </div>
      <div
        className={`flex items-center justify-between gap-4 rounded-xl px-5 py-4 transition-all duration-300 ${
          state === "active"
            ? "bg-surface-container-lowest ring-1 ring-primary/25 shadow-premium"
            : state === "done"
              ? "bg-surface-container-lowest/60 ring-1 ring-outline-variant/30"
              : ""
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-on-background">
            <span className="font-mono text-xs text-on-surface-variant/40 mr-3">{index}</span>
            {title}
          </p>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{desc}</p>
        </div>
        <span
          className={`shrink-0 text-[0.5625rem] font-bold uppercase tracking-[0.18em] font-mono ${
            state === "active"
              ? "text-primary"
              : state === "done"
                ? "text-secondary"
                : "text-on-surface-variant/40"
          }`}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

export default function CreatePage() {
  const [topic, setTopic] = useState("");
  const [progress, setProgress] = useState<PipelineProgress>({ stage: "idle", message: "" });
  const [dnaActive, setDnaActive] = useState(false);

  useEffect(() => {
    setDnaActive(hasTrainedDna());
    const onStorage = () => setDnaActive(hasTrainedDna());
    const onCustom = () => setDnaActive(hasTrainedDna());
    window.addEventListener("storage", onStorage);
    window.addEventListener("lunvo:dna-updated", onCustom);
    window.addEventListener("focus", onCustom);

    // Prefill from Marketplace (Use Template -> prefill)
    try {
      const params = new URLSearchParams(window.location.search);
      const template = params.get("template");
      const stored = window.localStorage.getItem("lunvo_prefill_topic");
      const prefill = template || stored;
      if (prefill) {
        const decoded = decodeURIComponent(prefill);
        setTopic(decoded);
        window.localStorage.removeItem("lunvo_prefill_topic");
        if (template) window.history.replaceState({}, "", "/dashboard/create");
      }
    } catch {}

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("lunvo:dna-updated", onCustom);
      window.removeEventListener("focus", onCustom);
    };
  }, []);

  const handleGenerate = async () => {
    const profile = getActiveAIProfile();
    if (
      !profile ||
      (profile.apiKey === "REDACTED_LOCAL_ONLY" &&
        profile.provider !== "ollama" &&
        profile.provider !== "lmstudio")
    ) {
      alert("Please configure your AI Provider in Settings first.");
      return;
    }

    if (!topic.trim()) return;

    try {
      // Phase 19: local-first Voice DNA (no Supabase). Falls back to null if not trained.
      const voiceDna = getVoiceDNA();
      let last = 0;
      const final = await runContentPipeline(profile, topic, voiceDna, (p) => {
        const now = Date.now();
        // Throttle per-token rerenders to ~10fps (was 50/sec jank)
        if (p.stage === "writing" && now - last < 100) return;
        last = now;
        setProgress(p);
      });
      // Phase 21: attach live ER (scoringEngine) — no hard 94%, store for dashboard
      const post = final.improvedPost;
      const hashtagCount = (post.match(/#\w+/g) || []).length;
      // derive hook score from finalScore (Critic 1-100 -> 0-10) as heuristic for ER
      const hookQuality = Math.min(10, Math.max(1, Math.round(final.finalScore / 10)));
      const live = predictEngagementRate({
        contentLength: post.length,
        hasHashtags: hashtagCount > 0,
        hashtagCount,
        postType: "text",
        dayOfWeek: new Date().toLocaleDateString("en-US", { weekday: "long" }),
        postHour: new Date().getHours(),
        hasMedia: false,
        hookQuality,
        ctaSpecificity: post.includes("?") ? 8 : 5,
      });
      setLastER(live.predictedEngagementRate);
      setLastHook(hookQuality);
      incrementUsage("generate");
      // refresh indicator after run (in case training happened in another tab)
      setDnaActive(hasTrainedDna());
    } catch (error) {
      console.error(error);
    }
  };

  const isGenerating =
    progress.stage !== "idle" && progress.stage !== "complete" && progress.stage !== "error";

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <PageHeader
        kicker="Content Factory"
        title={
          <>
            Commission a <em className="italic">post.</em>
          </>
        }
        description="Deploy the three-agent neural pipeline — Scout, Writer, Critic — to synthesize a highly optimized LinkedIn post from a single directive."
      />

      {/* Directive */}
      <Reveal delay={0.05}>
        <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/40 shadow-premium overflow-hidden focus-within:ring-primary/30 transition-all">
          <div className="flex items-center gap-3 px-7 pt-6 pb-1">
            <BrainCircuit className="w-4 h-4 text-primary" />
            <h2 className="font-serif text-lg text-on-background">Context directive</h2>
          </div>
          <p className="text-sm text-on-surface-variant px-7 pb-4">
            What topic, angle, or framework should the agents focus on?
          </p>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="E.g., Analyze why open-source models are replacing proprietary SaaS wrappers..."
            className="w-full h-36 bg-transparent px-7 pb-6 text-[0.9375rem] leading-relaxed text-on-background resize-none placeholder:text-on-surface-variant/40 border-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 px-7 py-5 border-t border-outline-variant/30 bg-surface-container-low/50">
            <div className="flex items-center gap-2.5">
              <ShieldCheck
                className={`w-4 h-4 ${dnaActive ? "text-secondary" : "text-on-surface-variant/40"}`}
              />
              <p className="text-xs text-on-surface-variant">
                {dnaActive ? (
                  <>
                    <span className="font-bold text-on-background">Voice DNA active</span> — your
                    tone will be auto-injected
                  </>
                ) : (
                  <>
                    <span className="font-bold text-on-background">No Voice DNA</span> —{" "}
                    <a href="/dashboard/studio" className="underline hover:text-primary">
                      train in Studio
                    </a>{" "}
                    to clone your voice
                  </>
                )}
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary text-sm font-bold shadow-premium hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {isGenerating ? "Executing pipeline..." : "Initialize agents"}
              {!isGenerating && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </section>
      </Reveal>

      {/* Pipeline */}
      {progress.stage !== "idle" && (
        <Reveal delay={0.05}>
          <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/40 shadow-premium p-7 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <p className="kicker">Neural pipeline status</p>
              <span className="font-mono text-[0.6875rem] text-on-surface-variant/40 tracking-widest">
                SCOUT → WRITER → CRITIC
              </span>
            </div>

            <div className="relative ml-0 pl-[41px] space-y-6 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-px before:bg-outline-variant/40">
              <Step
                icon={Search}
                index="01"
                title="Scout Agent"
                desc="Analyzes market trends and retrieves high-performing viral structures."
                state={
                  progress.stage === "scouting"
                    ? "active"
                    : progress.scoutResult
                      ? "done"
                      : "waiting"
                }
                statusLabel={
                  progress.scoutResult
                    ? "Complete"
                    : progress.stage === "scouting"
                      ? "Scanning"
                      : "Waiting"
                }
              />
              <Step
                icon={PenTool}
                index="02"
                title="Writer Agent"
                desc="Synthesizes the framework with your Voice DNA to craft the initial draft."
                state={
                  progress.stage === "writing" ? "active" : progress.draft ? "done" : "waiting"
                }
                statusLabel={
                  progress.draft
                    ? "Complete"
                    : progress.stage === "writing"
                      ? "Drafting"
                      : "Waiting"
                }
              />
              <Step
                icon={Check}
                index="03"
                title="Critic Agent"
                desc="Scores the draft against 20+ viral parameters and refines hook velocity."
                state={
                  progress.stage === "critiquing"
                    ? "active"
                    : progress.criticResult
                      ? "done"
                      : "waiting"
                }
                statusLabel={
                  progress.criticResult
                    ? "Complete"
                    : progress.stage === "critiquing"
                      ? "Auditing"
                      : "Waiting"
                }
              />
            </div>

            {/* Phase 23: live token streaming — draft word-by-word */}
            {progress.stage === "writing" && progress.streamingDraft && (
              <div className="mt-8 rounded-xl bg-surface-container-low ring-1 ring-primary/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[0.625rem] font-bold uppercase tracking-widest text-primary font-mono">
                    Streaming draft
                  </span>
                  <span className="text-[0.625rem] font-mono text-on-surface-variant/40">
                    {progress.streamingDraft.length} chars
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-on-background whitespace-pre-wrap font-mono">
                  {progress.streamingDraft}
                  <span className="inline-block w-2 h-5 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
                </p>
              </div>
            )}
            {progress.stage === "writing" && progress.streamingDraft === "" && (
              <div className="mt-8 flex items-center gap-2 text-xs text-on-surface-variant/60">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Writer is thinking...
              </div>
            )}

            {progress.stage === "error" && (
              <div className="mt-8 flex items-start gap-3 rounded-xl bg-error/[0.06] ring-1 ring-error/20 p-4">
                <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-error">Pipeline error</p>
                  <p className="text-sm text-error/80 mt-0.5">{progress.message}</p>
                </div>
              </div>
            )}
          </section>
        </Reveal>
      )}

      {/* Results — Post Editor */}
      {progress.stage === "complete" && progress.criticResult && (
        <Reveal delay={0.05}>
          <PostEditor
            content={progress.criticResult.improvedPost}
            score={progress.criticResult.finalScore}
            notes={progress.criticResult.critiqueNotes}
          />
        </Reveal>
      )}

      {/* Image Studio — always visible inside Create (editor studio), Relevancy vs Prompt toggle, 6 pro styles */}
      <Reveal delay={0.1}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="font-serif text-xl text-on-background">Image Studio</h2>
            <span className="text-[0.625rem] font-mono uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full">
              Inside Create
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Create visuals for this post — relevancy auto-fills from your topic/post, or use your
            own prompt.
          </p>
          <ImageStudio
            postContent={
              progress.criticResult?.improvedPost ||
              progress.draft ||
              topic ||
              "Professional LinkedIn post visual"
            }
          />
        </div>
      </Reveal>
    </div>
  );
}
