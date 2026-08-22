"use client";

import { useState } from "react";
import { Twitter, Mail, Video, Copy, Loader2 } from "lucide-react";
import { getActiveAIProfile } from "@/lib/apiHelper";
import { repurposeToTwitter } from "@/lib/ai/repurpose/twitterThread";
import { repurposeToNewsletter } from "@/lib/ai/repurpose/newsletterBlog";
import { repurposeToVideoScript } from "@/lib/ai/repurpose/videoScript";
import { copyToClipboard } from "@/lib/distribution/clipboard";

export default function RepurposePage() {
  const [sourcePost, setSourcePost] = useState("");
  const [activeTab, setActiveTab] = useState<"twitter" | "newsletter" | "video">("twitter");

  const [twitterResult, setTwitterResult] = useState<string[]>([]);
  const [newsletterResult, setNewsletterResult] = useState("");
  const [videoResult, setVideoResult] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    const profile = getActiveAIProfile();
    if (!profile || !sourcePost.trim()) return;

    setIsGenerating(true);
    try {
      if (activeTab === "twitter") {
        const tweets = await repurposeToTwitter(profile, sourcePost);
        setTwitterResult(tweets);
      } else if (activeTab === "newsletter") {
        const newsletter = await repurposeToNewsletter(profile, sourcePost);
        setNewsletterResult(newsletter);
      } else if (activeTab === "video") {
        const script = await repurposeToVideoScript(profile, sourcePost);
        setVideoResult(script);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-background dark:text-white flex items-center">
          <RepeatIcon className="w-8 h-8 mr-3 text-blue-600" />
          Content Repurposer
        </h1>
        <p className="text-on-surface-variant mt-2">
          Turn one LinkedIn post into multiple pieces of content instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Column */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-on-background dark:text-white">
            Source LinkedIn Post
          </label>
          <textarea
            value={sourcePost}
            onChange={(e) => setSourcePost(e.target.value)}
            placeholder="Paste your LinkedIn post here..."
            className="w-full h-[600px] p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {/* Output Column */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex p-1 bg-surface-container rounded-lg">
            <button
              onClick={() => setActiveTab("twitter")}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "twitter" ? "bg-surface-container-lowest text-on-background dark:text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface dark:hover:text-on-surface-variant/40"}`}
            >
              <Twitter className="w-4 h-4 mr-2 text-sky-500" /> Twitter Thread
            </button>
            <button
              onClick={() => setActiveTab("newsletter")}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "newsletter" ? "bg-surface-container-lowest text-on-background dark:text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface dark:hover:text-on-surface-variant/40"}`}
            >
              <Mail className="w-4 h-4 mr-2 text-orange-500" /> Newsletter
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "video" ? "bg-surface-container-lowest text-on-background dark:text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface dark:hover:text-on-surface-variant/40"}`}
            >
              <Video className="w-4 h-4 mr-2 text-purple-500" /> Video Script
            </button>
          </div>

          {/* Action Area */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 flex justify-between items-center">
            <p className="text-xs text-on-surface-variant">
              {activeTab === "twitter" && "Generates a 3-5 part numbered thread."}
              {activeTab === "newsletter" && "Expands into a long-form article."}
              {activeTab === "video" && "Creates a 60-second visual hook script."}
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !sourcePost.trim()}
              className="px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-lg text-sm font-bold hover:bg-surface-container-highest transition-colors disabled:opacity-50 flex items-center"
            >
              {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate {activeTab}
            </button>
          </div>

          {/* Results Area */}
          <div className="h-[500px] overflow-y-auto space-y-4 pb-12">
            {activeTab === "twitter" && twitterResult.length > 0 && (
              <div className="space-y-4">
                {twitterResult.map((tweet, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 relative group"
                  >
                    <button
                      onClick={() => handleCopy(`tweet-${idx}`, tweet)}
                      className="absolute top-3 right-3 p-1.5 bg-surface-container text-on-surface-variant rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedStates[`tweet-${idx}`] ? (
                        <span className="text-xs font-bold text-emerald-500">Copied!</span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <p className="text-sm whitespace-pre-wrap text-on-background pr-8">{tweet}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "newsletter" && newsletterResult && (
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 relative group">
                <button
                  onClick={() => handleCopy("news", newsletterResult)}
                  className="absolute top-4 right-4 p-2 bg-surface-container text-on-surface-variant rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedStates["news"] ? (
                    <span className="text-xs font-bold text-emerald-500">Copied!</span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{newsletterResult}</pre>
                </div>
              </div>
            )}

            {activeTab === "video" && videoResult && (
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 relative group">
                <button
                  onClick={() => handleCopy("video", videoResult)}
                  className="absolute top-4 right-4 p-2 bg-surface-container text-on-surface-variant rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedStates["video"] ? (
                    <span className="text-xs font-bold text-emerald-500">Copied!</span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{videoResult}</pre>
                </div>
              </div>
            )}

            {!isGenerating && twitterResult.length === 0 && !newsletterResult && !videoResult && (
              <div className="h-full flex items-center justify-center text-on-surface-variant/70 text-sm">
                Paste a post and hit generate to see the magic.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RepeatIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
