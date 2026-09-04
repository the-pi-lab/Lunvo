/**
 * LUNVO 2.0 — YouTube Ingestion & Transcript Extraction Engine
 * Extracts video metadata and spoken transcripts directly from YouTube
 * without requiring Google API keys.
 */

const YT_ID = "[A-Za-z0-9_-]{11}";
const YT_RE =
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?[^#\s]*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?#\/\s].*)?$/i;

export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== "string" || url.length > 500) return null;
  const m = url.trim().match(YT_RE);
  return m?.[1] ?? null;
}

export function isYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== "string" || url.length > 500) return false;
  return YT_RE.test(url.trim());
}

export { YT_RE };

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

/**
 * Fetches the spoken transcript for a YouTube video directly from caption tracks.
 */
export async function fetchYouTubeTranscript(videoId: string): Promise<string | null> {
  if (!videoId || !new RegExp(`^${YT_ID}$`).test(videoId)) return null;
  try {
    const pageUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    const pageRes = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!pageRes.ok) return null;
    const html = await pageRes.text();

    // Locate captionTracks inside ytInitialPlayerResponse. Bound the scan:
    // running the regex over multi-MB HTML risks long backtrack stalls.
    const marker = html.indexOf("ytInitialPlayerResponse");
    if (marker === -1) return null;
    const window = html.slice(marker, marker + 500000);
    const playerResponseMatch = window.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
    if (!playerResponseMatch || !playerResponseMatch[1]) return null;

    let playerResponse: any;
    try {
      playerResponse = JSON.parse(playerResponseMatch[1]);
    } catch {
      return null;
    }

    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captionTracks || !Array.isArray(captionTracks) || captionTracks.length === 0) {
      return null;
    }

    // Prefer English or default first track
    const englishTrack =
      captionTracks.find((t: any) => t.languageCode === "en" || t.vssId?.includes(".en")) ||
      captionTracks[0];

    if (!englishTrack?.baseUrl) return null;

    // Fetch subtitle XML
    const transcriptRes = await fetch(englishTrack.baseUrl, {
      signal: AbortSignal.timeout(8000),
    });

    if (!transcriptRes.ok) return null;
    const xml = await transcriptRes.text();

    // Extract text blocks
    const matches = Array.from(xml.matchAll(/<text[^>]*>(.*?)<\/text>/gs));
    if (!matches || matches.length === 0) return null;

    const phrases = matches.map((m) => decodeHtmlEntities(m[1] || "").trim()).filter(Boolean);

    const fullTranscript = phrases.join(" ");
    return fullTranscript.length > 50 ? fullTranscript : null;
  } catch {
    return null;
  }
}

/**
 * Fetches comprehensive YouTube video info including title, author, and full spoken transcript.
 */
export async function fetchYouTubeInfo(url: string): Promise<string> {
  const id = extractVideoId(url);
  if (!id) return url;

  let title = "";
  let author = "";

  // 1. Fetch metadata via oEmbed (id already strict-validated)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
    const res = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as { title?: string; author_name?: string };
      title = data.title?.trim() || "";
      author = data.author_name?.trim() || "";
    }
  } catch {
    // ignore
  }

  // 2. Fetch full spoken transcript — 9s overall deadline so a slow
  // transcript fetch can't hold the repurpose route past Vercel timeouts
  // (oEmbed already has its own 8s signal above).
  const transcript = await Promise.race([
    fetchYouTubeTranscript(id),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 9000)),
  ]);

  if (transcript) {
    const header = title
      ? `YouTube Video: "${title}"${author ? ` by ${author}` : ""}`
      : `YouTube Video (${id})`;
    return `${header} (https://www.youtube.com/watch?v=${id})\n\n--- Video Spoken Transcript ---\n${transcript.slice(0, 4500)}`;
  }

  if (title) {
    return `YouTube Video: "${title}"${author ? ` by ${author}` : ""} (https://www.youtube.com/watch?v=${id})\n\nRepurpose the core insights and topic of this video into high-engagement content.`;
  }

  return `YouTube Video https://www.youtube.com/watch?v=${id} — repurpose the key topic of this video.`;
}
