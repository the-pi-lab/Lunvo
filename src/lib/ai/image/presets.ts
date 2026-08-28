/**
 * Image Studio — 6 professional presets (LinkedIn only, no meme/3D clay)
 * Each preset is a prompt prefix + style hint for the image model.
 */

export type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16";

export interface StylePreset {
  id: string;
  label: string;
  desc: string;
  promptPrefix: string;
  palette: string;
  previewGradient: string;
}

export const IMAGE_STYLES: StylePreset[] = [
  {
    id: "minimal-editorial",
    label: "Minimal Editorial",
    desc: "Clean typography, white, subtle rule",
    promptPrefix:
      "Minimal editorial poster, clean white background, bold serif headline, generous whitespace, subtle thin rule, professional LinkedIn aesthetic",
    palette: "monochrome",
    previewGradient: "from-white to-zinc-100",
  },
  {
    id: "corporate-gradient",
    label: "Corporate Gradient",
    desc: "Soft blue→lavender gradient, premium",
    promptPrefix:
      "Corporate gradient poster, soft blue to lavender gradient, glassmorphism card, subtle grain, premium B2B LinkedIn cover",
    palette: "blue-lavender",
    previewGradient: "from-blue-50 via-violet-50 to-blue-100",
  },
  {
    id: "data-chart",
    label: "Data Chart",
    desc: "Infographic / chart visual",
    promptPrefix:
      "Data infographic, clean chart, minimal grid, flat vector icons, sans-serif labels, LinkedIn carousel data slide",
    palette: "blue",
    previewGradient: "from-emerald-50 to-sky-50",
  },
  {
    id: "quote-card",
    label: "Quote Card",
    desc: "Large quote, author line",
    promptPrefix:
      "Quote card, large serif quotation, author line small caps, generous padding, high contrast black on warm white",
    palette: "warm",
    previewGradient: "from-amber-50 to-orange-50",
  },
  {
    id: "photo-office",
    label: "Photo — Office",
    desc: "Photoreal office, shallow depth",
    promptPrefix:
      "Photoreal office workspace, shallow depth of field, natural light, people collaborating, LinkedIn header photo, realistic",
    palette: "photo",
    previewGradient: "from-zinc-100 to-zinc-200",
  },
  {
    id: "carousel-text",
    label: "Carousel Text",
    desc: "5-slide text carousel (pptx)",
    promptPrefix:
      "Carousel slide set, 5 slides, bold headline per slide, numbered, minimal icons, consistent grid, LinkedIn carousel 1080x1350",
    palette: "carousel",
    previewGradient: "from-violet-50 to-indigo-50",
  },
];

export function buildImagePrompt(
  base: string,
  style: StylePreset,
  opts: { aspect: AspectRatio; palette: string; withText: boolean }
): string {
  const aspectHint = `aspect ${opts.aspect}, ${opts.aspect === "4:5" ? "1080x1350" : opts.aspect === "16:9" ? "1200x628" : opts.aspect === "9:16" ? "1080x1920" : "1024x1024"}`;
  const paletteHint = opts.palette !== "default" ? `, palette ${opts.palette}` : "";
  const textHint = opts.withText ? ", with headline text overlay" : ", no text, pure visual";
  return `${style.promptPrefix}${paletteHint}, ${aspectHint}${textHint}. Subject: ${base}`.trim();
}
