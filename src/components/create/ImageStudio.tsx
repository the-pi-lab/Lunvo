"use client";

import { useState } from "react";
import { Image as ImageIcon, Sparkles, Wand2, Download, Copy, Check } from "lucide-react";
import { IMAGE_STYLES, buildImagePrompt, type AspectRatio } from "@/lib/ai/image/presets";
import { generateImage } from "@/lib/ai/image/generator";
import { downloadCarouselPDF } from "@/lib/carousel/generator";

interface ImageStudioProps {
  postContent: string;
}

export function ImageStudio({ postContent }: ImageStudioProps) {
  const [mode, setMode] = useState<"relevancy" | "prompt">("relevancy");
  const [selectedStyle, setSelectedStyle] = useState(IMAGE_STYLES[0]!.id);
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspect, setAspect] = useState<AspectRatio>("4:5");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [copied, setCopied] = useState(false);

  const style = IMAGE_STYLES.find((s) => s.id === selectedStyle) || IMAGE_STYLES[0]!;

  const handleGenerate = async () => {
    // Carousel moat: 5-slide PDF
    if (selectedStyle === "carousel-text") {
      if (!postContent.trim() && mode === "relevancy") {
        alert("Add post content first for carousel");
        return;
      }
      const base = mode === "relevancy" ? postContent : customPrompt.trim() || postContent;
      if (!base.trim()) return;
      setGenerating(true);
      try {
        await downloadCarouselPDF(base);
      } catch (e) {
        console.error("Carousel failed", e);
        alert("Carousel generation failed");
      } finally {
        setGenerating(false);
      }
      return;
    }

    const basePrompt =
      mode === "relevancy"
        ? postContent.slice(0, 300) || "Professional LinkedIn post"
        : customPrompt.trim() || "Professional LinkedIn visual";
    if (!basePrompt.trim()) return;
    setGenerating(true);
    try {
      const prompt = buildImagePrompt(basePrompt, style, {
        aspect,
        palette: style.palette,
        withText: style.id === "quote-card" || style.id === "minimal-editorial",
      });
      const res = await generateImage({
        prompt,
        styleId: style.id,
        aspect,
        withText: style.id === "quote-card",
      });
      setImageUrl(res.url);
      setIsFallback(res.isFallback);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!imageUrl) return;
    try {
      if (
        imageUrl.startsWith("data:") &&
        typeof ClipboardItem !== "undefined" &&
        navigator.clipboard.write
      ) {
        try {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          // @ts-ignore - ClipboardItem may not be typed in all lib versions
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } catch {
          // fall through to text copy
        }
      }
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(imageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // final fallback: prompt
        window.prompt("Copy image URL:", imageUrl);
      }
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/40 shadow-premium overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-5 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-on-background leading-none">Image Studio</h3>
            <p className="text-xs text-on-surface-variant">6 pro styles • no meme</p>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-full bg-surface-container-low ring-1 ring-outline-variant/30">
          <button
            onClick={() => setMode("relevancy")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${mode === "relevancy" ? "bg-zinc-900 text-white shadow" : "text-on-surface-variant hover:text-on-background"}`}
          >
            Relevancy
          </button>
          <button
            onClick={() => setMode("prompt")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${mode === "prompt" ? "bg-zinc-900 text-white shadow" : "text-on-surface-variant hover:text-on-background"}`}
          >
            Prompt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Controls */}
        <div className="lg:col-span-7 p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-outline-variant/30">
          {/* Style grid 3x2 */}
          <div>
            <p className="kicker mb-3">Style — professional only</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {IMAGE_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`group text-left rounded-xl p-4 ring-1 transition-all ${selectedStyle === s.id ? "ring-primary bg-primary/[0.06] shadow-premium" : "ring-outline-variant/30 bg-surface-container-low hover:ring-primary/20"}`}
                >
                  <div
                    className={`w-full h-14 rounded-lg bg-gradient-to-br ${s.previewGradient} ring-1 ring-black/5 mb-3`}
                  />
                  <div className="text-xs font-bold text-on-background leading-tight">
                    {s.label}
                  </div>
                  <div className="text-[0.6875rem] text-on-surface-variant leading-tight mt-0.5">
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt box (only in prompt mode) */}
          {mode === "prompt" ? (
            <div>
              <label className="kicker block mb-2">Custom prompt</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Minimal pastel carousel for Indian fintech founders, clean icons..."
                rows={3}
                className="w-full rounded-xl bg-surface-container-low ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-4 py-3 text-sm text-on-background outline-none placeholder:text-on-surface-variant/40 resize-none"
              />
            </div>
          ) : (
            <div className="rounded-xl bg-surface-container-low ring-1 ring-outline-variant/20 p-4">
              <div className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-1">
                Relevancy — from post
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                {postContent.slice(0, 180) || "Post content will be used to craft relevant visual"}
              </p>
            </div>
          )}

          {/* Aspect */}
          <div>
            <p className="kicker mb-2">
              Aspect{" "}
              {selectedStyle === "carousel-text" && (
                <span className="text-[0.5625rem] normal-case tracking-normal text-on-surface-variant/50">
                  (fixed 4:5 for carousel)
                </span>
              )}
            </p>
            <div className="flex gap-2">
              {(["1:1", "4:5", "16:9", "9:16"] as AspectRatio[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAspect(a)}
                  disabled={selectedStyle === "carousel-text" && a !== "4:5"}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold ring-1 transition-colors ${aspect === a ? "bg-primary text-on-primary ring-primary" : "bg-surface-container-low ring-outline-variant/40 text-on-surface-variant hover:text-on-background"} ${selectedStyle === "carousel-text" && a !== "4:5" ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={
              generating ||
              (mode === "prompt" && !customPrompt.trim()) ||
              (selectedStyle === "carousel-text" && !postContent.trim() && !customPrompt.trim())
            }
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-bold shadow-premium hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            {generating ? (
              <Wand2 className="w-4 h-4 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating
              ? "Generating..."
              : selectedStyle === "carousel-text"
                ? "Download PDF — 5 slides (1080×1350)"
                : `Generate with ${style.label}`}
          </button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-5 p-6 bg-[#F3F2EF] flex flex-col">
          <div className="w-full max-w-[360px] mx-auto bg-white rounded-sm shadow-sm overflow-hidden ring-1 ring-black/5">
            {selectedStyle === "carousel-text" ? (
              <div className="p-3 bg-zinc-100">
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="aspect-[3/4] rounded-md bg-white ring-1 ring-black/5 flex flex-col items-center justify-center p-2"
                    >
                      <span className="text-[0.5625rem] font-mono font-bold text-primary">
                        0{n}
                      </span>
                      <span className="text-[0.625rem] font-semibold text-zinc-900 text-center leading-tight mt-1 line-clamp-3">
                        {n === 1 ? "Cover" : n === 5 ? "CTA" : `Slide ${n}`}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[0.625rem] font-mono uppercase tracking-widest text-zinc-400 mt-3">
                  5 slides • 1080×1350 PDF
                </p>
              </div>
            ) : (
              <div className="aspect-[4/5] bg-zinc-100 relative overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-8">
                    <div
                      className={`w-full h-32 rounded-lg bg-gradient-to-br ${style.previewGradient} ring-1 ring-black/5 mb-4`}
                    />
                    <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      Preview
                    </p>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                      {mode === "relevancy"
                        ? "Will generate relevant to your post"
                        : "Will generate from your prompt"}
                    </p>
                  </div>
                )}
                {isFallback && imageUrl && (
                  <span className="absolute bottom-2 right-2 text-[0.5625rem] font-mono uppercase tracking-widest bg-black/60 text-white px-2 py-1 rounded-full">
                    Fallback canvas
                  </span>
                )}
              </div>
            )}
            <div className="p-4 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-semibold text-on-background">{style.label}</div>
                <div className="text-on-surface-variant/60 font-mono">
                  {selectedStyle === "carousel-text"
                    ? "1080×1350 • PDF 5 slides"
                    : `${aspect} • ${isFallback ? "Canvas" : "AI"}`}
                </div>
              </div>
              <div className="flex gap-2">
                {selectedStyle !== "carousel-text" && imageUrl && (
                  <>
                    <a
                      href={imageUrl}
                      download={`lunvo-${style.id}.png`}
                      className="p-2 rounded-lg bg-surface-container-low ring-1 ring-outline-variant/30 text-on-surface-variant hover:text-primary"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg bg-surface-container-low ring-1 ring-outline-variant/30 text-on-surface-variant hover:text-primary"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
                {selectedStyle === "carousel-text" && (
                  <span className="text-[0.625rem] font-mono uppercase tracking-widest text-zinc-400">
                    PDF
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-center text-[0.625rem] font-mono uppercase tracking-widest text-zinc-400 mt-3">
            {selectedStyle === "carousel-text"
              ? "5 templates • Download PDF"
              : "Falls back to canvas if no image model"}
          </p>
        </div>
      </div>
    </div>
  );
}
