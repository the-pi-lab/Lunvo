/**
 * LUNVO 2.0 — Local-First Image & Visual Generator
 * Multi-engine: BYOK DALL-E / Flux via OpenAI-compatible endpoint,
 * free realistic neural generation via Pollinations, with canvas card fallback.
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

  // Gradient background
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#0F172A");
  g.addColorStop(1, "#1E293B");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Aurora accent border
  ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Text title
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "600 44px 'Plus Jakarta Sans', sans-serif";
  const words = prompt.slice(0, 100).split(" ");
  let y = 240;
  let line = "";
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > canvas.width - 160) {
      ctx.fillText(line, 80, y);
      y += 60;
      line = w + " ";
    } else {
      line = test;
    }
  }
  ctx.fillText(line, 80, y);

  // Brand tag
  ctx.fillStyle = "#38BDF8";
  ctx.font = "bold 22px 'JetBrains Mono', monospace";
  ctx.fillText(`LUNVO • ${styleId.toUpperCase().replace(/-/g, " ")}`, 80, canvas.height - 80);

  return canvas.toDataURL("image/png");
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  const profile = getActiveAIProfile();

  const width = input.aspect === "16:9" ? 1280 : input.aspect === "4:5" ? 1024 : 1024;
  const height = input.aspect === "16:9" ? 720 : input.aspect === "4:5" ? 1280 : 1024;

  // 1. Try BYOK OpenAI / Custom Image Generator if configured
  if (profile && profile.apiKey && profile.baseURL) {
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
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const data = await res.json();
        const b64 = data.data?.[0]?.b64_json as string | undefined;
        const url = data.data?.[0]?.url as string | undefined;
        if (b64) return { url: `data:image/png;base64,${b64}`, isFallback: false };
        if (url) return { url, isFallback: false };
      }
    } catch {
      // continue to free neural visual generator
    }
  }

  // 2. Free Neural Visual Generator (Pollinations AI)
  try {
    const seed = Math.floor(Math.random() * 100000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      input.prompt
    )}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux`;

    // Verify availability
    const testRes = await fetch(pollinationsUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
    });
    if (testRes.ok || testRes.status === 200 || testRes.type === "opaque") {
      return { url: pollinationsUrl, isFallback: false };
    }
  } catch {
    // continue to local canvas fallback
  }

  // 3. Fallback High-Resolution Local Canvas Visual Card
  return { url: fallbackCanvas(input.prompt, input.styleId), isFallback: true };
}
