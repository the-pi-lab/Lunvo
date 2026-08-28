/**
 * Local-first image generator — BYOC / BYOK (same vault as text)
 * If no image-capable key, falls back to canvas gradient card.
 */

import { getActiveAIProfile } from "@/lib/apiHelper";

export interface GenerateImageInput {
  prompt: string;
  styleId: string;
  aspect: string;
  withText: boolean;
}

export interface GenerateImageResult {
  url: string; // blob: or data: or https:
  isFallback: boolean;
}

function fallbackCanvas(prompt: string, styleId: string): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d")!;
  // gradient
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, "#eef2ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // border
  ctx.strokeStyle = "rgba(229,226,218,0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  // text
  ctx.fillStyle = "#1A1814";
  ctx.font = "600 42px 'Plus Jakarta Sans', sans-serif";
  const words = prompt.slice(0, 80).split(" ");
  let y = 200;
  let line = "";
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > canvas.width - 120) {
      ctx.fillText(line, 60, y);
      y += 56;
      line = w + " ";
    } else {
      line = test;
    }
  }
  ctx.fillText(line, 60, y);
  // style tag
  ctx.fillStyle = "#6B7280";
  ctx.font = "500 20px JetBrains Mono, monospace";
  ctx.fillText(styleId.toUpperCase().replace(/-/g, " "), 60, canvas.height - 80);
  return canvas.toDataURL("image/png");
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  const profile = getActiveAIProfile();

  // If no profile or provider doesn't support images, fallback canvas
  if (!profile || !profile.apiKey || !profile.baseURL) {
    return { url: fallbackCanvas(input.prompt, input.styleId), isFallback: true };
  }

  // Try OpenAI-compatible /images/generations
  try {
    const endpoint = `${profile.baseURL.replace(/\/+$/, "")}/images/generations`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${profile.apiKey}`,
        ...(profile.customHeaders || {}),
      },
      body: JSON.stringify({
        model:
          profile.model.includes("dall-e") || profile.model.includes("image")
            ? profile.model
            : "dall-e-3",
        prompt: input.prompt,
        n: 1,
        size:
          input.aspect === "4:5"
            ? "1024x1792"
            : input.aspect === "16:9"
              ? "1792x1024"
              : "1024x1024",
        response_format: "b64_json",
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json as string | undefined;
    const url = data.data?.[0]?.url as string | undefined;

    if (b64) return { url: `data:image/png;base64,${b64}`, isFallback: false };
    if (url) return { url, isFallback: false };
    throw new Error("No image in response");
  } catch {
    // Fallback canvas on any error (keeps studio usable without image model)
    return { url: fallbackCanvas(input.prompt, input.styleId), isFallback: true };
  }
}
