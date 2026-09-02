/**
 * YouTube helper — oEmbed + fallback, no API key needed
 * Turns a YouTube URL into text for repurposing
 */

export function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/");
    const embedIdx = parts.indexOf("embed");
    if (embedIdx !== -1) return parts[embedIdx + 1] || null;
    const shortsIdx = parts.indexOf("shorts");
    if (shortsIdx !== -1) return parts[shortsIdx + 1] || null;
    return null;
  } catch {
    return null;
  }
}

export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes("youtube.com") || lower.includes("youtu.be");
}

export async function fetchYouTubeInfo(url: string): Promise<string> {
  const id = extractVideoId(url);
  if (!id) return url;

  // Try oEmbed (no key, fast)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    const res = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as { title?: string; author_name?: string };
      const title = data.title?.trim();
      const author = data.author_name?.trim();
      if (title) {
        return `YouTube Video: "${title}"${author ? ` by ${author}` : ""} (https://www.youtube.com/watch?v=${id})\n\nTranscribe and repurpose the core insight of this video into a new format.`;
      }
    }
  } catch {
    // ignore
  }

  // Fallback: noembed
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = (await res.json()) as { title?: string; author_name?: string };
      if (data.title) {
        return `YouTube Video: "${data.title}"${data.author_name ? ` by ${data.author_name}` : ""} (https://www.youtube.com/watch?v=${id})`;
      }
    }
  } catch {
    // ignore
  }

  return `YouTube Video https://www.youtube.com/watch?v=${id} — repurpose the topic of this video.`;
}
