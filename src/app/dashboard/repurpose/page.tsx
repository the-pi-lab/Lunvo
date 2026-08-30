"use client";

import { useState } from "react";
import {
  Twitter,
  Mail,
  Video,
  Copy,
  Loader2,
  Check,
  Repeat,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getActiveAIProfile, getApiHeaders } from "@/lib/apiHelper";
import { repurposeToTwitter } from "@/lib/ai/repurpose/twitterThread";
import { repurposeToNewsletter } from "@/lib/ai/repurpose/newsletterBlog";
import { repurposeToVideoScript } from "@/lib/ai/repurpose/videoScript";
import { copyToClipboard } from "@/lib/distribution/clipboard";
import PageHeader from "@/components/premium/PageHeader";
import Reveal from "@/components/motion/Reveal";

const TABS = [
  {
    id: "twitter",
    label: "Twitter thread",
    hint: "Generates a 3–5 part numbered thread.",
    icon: Twitter,
  },
  { id: "newsletter", label: "Newsletter", hint: "Expands into a long-form article.", icon: Mail },
  {
    id: "video",
    label: "Video script",
    hint: "Creates a 60-second visual hook script.",
    icon: Video,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function RepurposePage() {
  const [sourcePost, setSourcePost] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("twitter");

  const [twitterResult, setTwitterResult] = useState<string[]>([]);
  const [newsletterResult, setNewsletterResult] = useState("");
  const [videoResult, setVideoResult] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const getPostPayload = () => {
    const yt = youtubeUrl.trim();
    const post = sourcePost.trim();
    if (yt) return { post, youtubeUrl: yt };
    return { post };
  };

  const handleGenerate = async () => {
    const { post, youtubeUrl: yt } = getPostPayload();
    if (!post && !yt) return;

    // Try API route first (supports YouTube + 1-click + cost guard), fallback to direct BYOK
    const tryApi = async (target: string) => {
      try {
        const res = await fetch("/api/repurpose", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getApiHeaders() } as Record<
            string,
            string
          >,
          body: JSON.stringify({ post, youtubeUrl: yt, target }),
        });
        if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Rate limit — 10/day");
          return null;
        }
        if (res.ok) return await res.json();
        return null;
      } catch {
        return null;
      }
    };

    setIsGenerating(true);
    try {
      const apiData = await tryApi(activeTab);
      if (apiData) {
        if (activeTab === "twitter" && apiData.tweets) setTwitterResult(apiData.tweets);
        else if (activeTab === "newsletter" && apiData.newsletter)
          setNewsletterResult(apiData.newsletter);
        else if (activeTab === "video" && apiData.video) setVideoResult(apiData.video);
        return;
      }
      // Fallback direct BYOK
      const profile = getActiveAIProfile();
      if (!profile) {
        alert("Add AI key in Studio → Providers or use API");
        return;
      }
      const effectivePost = yt ? `${yt}\n\n${post}` : post;
      if (activeTab === "twitter") {
        const tweets = await repurposeToTwitter(profile, effectivePost);
        setTwitterResult(tweets);
      } else if (activeTab === "newsletter") {
        const newsletter = await repurposeToNewsletter(profile, effectivePost);
        setNewsletterResult(newsletter);
      } else if (activeTab === "video") {
        const script = await repurposeToVideoScript(profile, effectivePost);
        setVideoResult(script);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    const { post, youtubeUrl: yt } = getPostPayload();
    if (!post && !yt) return;
    setIsGeneratingAll(true);
    try {
      // 1 post -> Thread + Newsletter 1 click via API
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getApiHeaders() } as Record<
          string,
          string
        >,
        body: JSON.stringify({ post, youtubeUrl: yt, target: "all" }),
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Rate limit");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.tweets) setTwitterResult(data.tweets);
        if (data.newsletter) setNewsletterResult(data.newsletter);
        setActiveTab("twitter");
        return;
      }
      // Fallback: parallel direct
      const profile = getActiveAIProfile();
      if (!profile) {
        alert("Add AI key");
        return;
      }
      const effectivePost = yt ? `${yt}\n\n${post}` : post;
      const [tweets, newsletter] = await Promise.all([
        repurposeToTwitter(profile, effectivePost),
        repurposeToNewsletter(profile, effectivePost),
      ]);
      setTwitterResult(tweets);
      setNewsletterResult(newsletter);
      setActiveTab("twitter");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedStates({ ...copiedStates, [id]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [id]: false });
      }, 2000);
    }
  };

  const activeHint = TABS.find((t) => t.id === activeTab)?.hint;
  const hasAnyResult =
    twitterResult.length > 0 || Boolean(newsletterResult) || Boolean(videoResult);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <PageHeader
        kicker="Repurposer"
        title={
          <>
            One post, <em className="italic">many formats.</em>
          </>
        }
        description="Feed it a published LinkedIn post and receive a thread, a newsletter, or a video script — each rewritten for its native channel."
      />

      <Reveal delay={0.05}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source */}
          <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/40 shadow-premium overflow-hidden focus-within:ring-primary/30 transition-all self-start">
            <div className="flex items-center gap-3 px-7 pt-6 pb-4">
              <Repeat className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-lg text-on-background">Source</h2>
            </div>
            {/* YouTube URL — optional */}
            <div className="px-7 pb-3">
              <label className="kicker block mb-1.5">YouTube URL (optional)</label>
              <input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=...  — paste to repurpose video insight"
                className="w-full rounded-lg bg-surface-container-low ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-3.5 py-2.5 text-sm text-on-background outline-none placeholder:text-on-surface-variant/40"
              />
              <p className="text-[0.625rem] font-mono text-on-surface-variant/40 mt-1.5">
                We fetch title via oEmbed (no API key) and repurpose it.
              </p>
            </div>
            <textarea
              value={sourcePost}
              onChange={(e) => setSourcePost(e.target.value)}
              placeholder="Paste your LinkedIn post here... or leave empty if using YouTube URL"
              className="w-full h-[380px] px-7 pb-7 bg-transparent text-[0.9375rem] leading-relaxed text-on-background outline-none resize-none placeholder:text-on-surface-variant/40 border-none focus:ring-0"
            />
            <div className="px-7 pb-5">
              <button
                onClick={handleGenerateAll}
                disabled={isGeneratingAll || (!sourcePost.trim() && !youtubeUrl.trim())}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider shadow-premium hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                {isGeneratingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                1 post → Thread + Newsletter (1 click)
              </button>
              <p className="text-center text-[0.625rem] font-mono uppercase tracking-widest text-on-surface-variant/40 mt-2">
                Calls /api/repurpose with YouTube support
              </p>
            </div>
          </section>

          {/* Output */}
          <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/40 shadow-premium overflow-hidden self-start min-h-[600px] flex flex-col">
            <div className="flex items-end gap-6 px-7 pt-5 border-b border-outline-variant/30">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative pb-3.5 pt-2 text-[0.8125rem] font-semibold flex items-center gap-2 transition-colors ${
                      activeTab === t.id
                        ? "text-on-background"
                        : "text-on-surface-variant/70 hover:text-on-background"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                    {activeTab === t.id && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-4 px-7 py-4 border-b border-outline-variant/30 bg-surface-container-low/50">
              <p className="text-xs text-on-surface-variant">{activeHint}</p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!sourcePost.trim() && !youtubeUrl.trim())}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold uppercase tracking-wider shadow-premium hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                Generate
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[520px]">
              {isGenerating && (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-4 text-on-surface-variant">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" strokeWidth={1.5} />
                  <p className="font-serif text-base">Rewriting for the new format...</p>
                </div>
              )}

              {!isGenerating && activeTab === "twitter" && twitterResult.length > 0 && (
                <div className="space-y-4">
                  {twitterResult.map((tweet, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl ring-1 ring-outline-variant/30 bg-surface-container-low/50 p-5 pr-12"
                    >
                      <span className="absolute top-4 left-5 font-mono text-[0.6875rem] font-bold text-on-surface-variant/40">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <button
                        onClick={() => handleCopy(`tweet-${idx}`, tweet)}
                        className="absolute top-3.5 right-3.5 p-1.5 rounded-md text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Copy tweet ${idx + 1}`}
                      >
                        {copiedStates[`tweet-${idx}`] ? (
                          <Check className="w-4 h-4 text-secondary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <p className="text-sm whitespace-pre-wrap text-on-background pl-8 leading-relaxed">
                        {tweet}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {!isGenerating && activeTab === "newsletter" && newsletterResult && (
                <div className="group relative rounded-xl ring-1 ring-outline-variant/30 bg-surface-container-low/50 p-6">
                  <button
                    onClick={() => handleCopy("news", newsletterResult)}
                    className="absolute top-4 right-4 p-2 rounded-md text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Copy newsletter"
                  >
                    {copiedStates["news"] ? (
                      <Check className="w-4 h-4 text-secondary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-on-background leading-relaxed pr-10">
                    {newsletterResult}
                  </pre>
                </div>
              )}

              {!isGenerating && activeTab === "video" && videoResult && (
                <div className="group relative rounded-xl ring-1 ring-outline-variant/30 bg-surface-container-low/50 p-6">
                  <button
                    onClick={() => handleCopy("video", videoResult)}
                    className="absolute top-4 right-4 p-2 rounded-md text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Copy video script"
                  >
                    {copiedStates["video"] ? (
                      <Check className="w-4 h-4 text-secondary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <pre className="whitespace-pre-wrap font-mono text-[0.8125rem] text-on-background leading-relaxed pr-10">
                    {videoResult}
                  </pre>
                </div>
              )}

              {!isGenerating && !hasAnyResult && (
                <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center px-8">
                  <Repeat className="w-8 h-8 text-on-surface-variant/25 mb-4" strokeWidth={1.5} />
                  <p className="font-serif text-lg text-on-background">The press is idle.</p>
                  <p className="text-sm text-on-surface-variant mt-1.5 max-w-[240px] leading-relaxed">
                    Paste a post on the left and hit generate to see it transformed.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </Reveal>
    </div>
  );
}
