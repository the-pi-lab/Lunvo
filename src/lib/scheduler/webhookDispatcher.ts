/**
 * LUNVO 2.0 — Webhook Dispatcher Engine
 * Zero-Ban Architecture: Pushes formatted content and carousel PDF payloads
 * to user-owned automation platforms (Zapier, Make.com, Buffer, Pipedream).
 */

import type { ScheduledPost } from "./types";

export interface DispatchResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  timestamp: string;
}

export interface WebhookPayloadFormat {
  event?: string;
  postId?: string;
  id?: string;
  title: string;
  content: string;
  wordCount?: number;
  characterCount?: number;
  criticScore?: number;
  humanScore?: number;
  scheduledTime: string;
  source: string;
  tags?: string[];
  carouselPdfBase64?: string;
  meta: {
    source: string;
    version: string;
  };
}

export function buildOutboundPayload(post: ScheduledPost): WebhookPayloadFormat {
  const content = post.content || "";
  const words = content.trim().split(/\s+/).filter(Boolean);
  const detectedTags = content.match(/#[a-zA-Z0-9_]+/g) || [];
  const mergedTags = Array.from(new Set([...(post.tags || []), ...detectedTags]));

  return {
    event: "lunvo.post.publish",
    postId: post.id,
    id: post.id,
    title: post.title,
    content: post.content,
    wordCount: words.length,
    characterCount: content.length,
    criticScore: post.criticScore,
    humanScore: post.humanScore,
    scheduledTime: post.scheduledTime,
    source: post.source || "studio",
    tags: mergedTags,
    carouselPdfBase64: post.carouselPdfBase64,
    meta: {
      source: post.source || "lunvo_studio",
      version: "2.0.0",
    },
  };
}

export const formatWebhookPayload = buildOutboundPayload;

/**
 * Validates that a webhook URL is safe against SSRF attacks.
 * Blocks loopback, cloud metadata, link-local, hex/octal representations, and private subnets.
 */
function parseIpv4Octet(part: string): number | null {
  const p = part.trim().toLowerCase();
  if (p.length === 0) return null;
  // hex 0x7f, octal 0177, decimal
  let v: number;
  if (/^0x[0-9a-f]+$/.test(p)) v = parseInt(p, 16);
  else if (/^0[0-7]+$/.test(p) && p.length > 1) v = parseInt(p, 8);
  else if (/^\d+$/.test(p)) v = parseInt(p, 10);
  else return null;
  if (!Number.isFinite(v) || v < 0 || v > 255) return null;
  return v;
}

function hostnameToIpv4(hostname: string): number[] | null {
  // single integer like 2130706433 or 0x7f000001
  const h = hostname.toLowerCase();
  if (/^0x[0-9a-f]+$/.test(h)) {
    const v = parseInt(h, 16) >>> 0;
    return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
  }
  if (/^\d+$/.test(h)) {
    const v = Number(h) >>> 0;
    if (!Number.isFinite(v)) return null;
    return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
  }
  const parts = h.split(".");
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    const v = parseIpv4Octet(part);
    if (v === null) return null;
    octets.push(v);
  }
  return octets as number[];
}

function isBlockedIp(oct: number[]): boolean {
  const [a, b] = [oct[0]!, oct[1]!];
  // loopback 127.x, link-local 169.254.x, 0.x, private 10/172.16-31/192.168
  if (oct[0] === 127) return true;
  if (oct[0] === 0) return true;
  if (oct[0] === 169 && oct[1] === 254) return true;
  if (oct[0] === 10) return true;
  if (oct[0] === 172 && b >= 16 && b <= 31) return true;
  if (oct[0] === 192 && b === 168) return true;
  return false;
}

export function isSafeWebhookUrl(urlString: string): { valid: boolean; reason?: string } {
  try {
    if (!urlString || typeof urlString !== "string") {
      return { valid: false, reason: "URL is empty or invalid" };
    }

    const trimmed = urlString.trim();
    if (trimmed.length > 2048) return { valid: false, reason: "URL too long" };
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { valid: false, reason: "Only HTTP/HTTPS webhook protocols are permitted" };
    }
    // block userinfo smuggling: https://evil@127.0.0.1
    if (url.username || url.password) {
      return { valid: false, reason: "Userinfo in URL is blocked" };
    }

    const hostname = url.hostname.toLowerCase();

    // Block loopback, link-local, and cloud metadata endpoints
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "0.0.0.0" ||
      hostname === "[::]" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname === "169.254.169.254" ||
      hostname === "metadata.google.internal" ||
      hostname === "metadata.google.com" ||
      hostname.startsWith("169.254.") ||
      hostname.startsWith("0.") ||
      hostname.includes("::ffff:127.") ||
      hostname.includes("::ffff:169.254.") ||
      hostname.includes("::ffff:0:") ||
      /\[.*:.*\]/.test(hostname)
    ) {
      return {
        valid: false,
        reason: "Internal loopback and metadata endpoints are blocked for security",
      };
    }

    // Block any numeric/encoded IPv4 (dotted hex/octal/int + single-label int)
    const asIp = hostnameToIpv4(hostname);
    if (asIp && isBlockedIp(asIp)) {
      return { valid: false, reason: "Private/loopback IP range is blocked" };
    }
    // single-label numeric that didn't parse as IPv4 (e.g. huge int) — block anyway
    if (/^(0x[0-9a-f]+|\d+)$/i.test(hostname)) {
      return { valid: false, reason: "Numeric or encoded IP representations are blocked" };
    }
    // dotted parts that look encoded but didn't form valid IPv4 (0x7f.0.0.1 etc.)
    if (/(^|\.)0x[0-9a-f]+(\.|$)/i.test(hostname) || /(^|\.)0\d+(\.|$)/.test(hostname)) {
      return { valid: false, reason: "Encoded IP octet is blocked" };
    }

    // Block private subnets ALWAYS (self-host VPS metadata protection).
    // Local dev loopback via http://localhost:* is still allowed above only for
    // literal localhost; 127/10/172.16/192.168 are blocked even in dev.
    const isPrivateIpv4 =
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname);

    if (isPrivateIpv4) {
      return { valid: false, reason: "Private network destinations are blocked" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Malformed URL format" };
  }
}

/**
 * Dispatches a post to its configured webhook endpoint.
 */
export async function dispatchScheduledPost(
  post: ScheduledPost,
  overrideWebhookUrl?: string
): Promise<DispatchResult> {
  const targetUrl = overrideWebhookUrl || post.targetWebhookUrl || (post as any).webhookUrl;

  if (!targetUrl) {
    return {
      success: false,
      error: "No webhook URL configured for this post.",
      timestamp: new Date().toISOString(),
    };
  }

  // SSRF guard
  const validation = isSafeWebhookUrl(targetUrl);
  if (!validation.valid) {
    return {
      success: false,
      error: `Security blocked webhook dispatch: ${validation.reason}`,
      timestamp: new Date().toISOString(),
    };
  }

  const payload = buildOutboundPayload(post);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch(targetUrl, {
      method: "POST",
      // manual redirect: re-validate Location against SSRF guard instead of blind follow
      redirect: "manual",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "LUNVO-Webhook-Dispatcher/2.0",
        "X-Lunvo-Delivery-Timestamp": new Date().toISOString(),
        "X-Lunvo-Post-Id": post.id,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const loc = response.headers.get("location");
    if (
      (response.status >= 300 && response.status < 400 && loc) ||
      response.type === "opaqueredirect"
    ) {
      const next = loc ? new URL(loc, targetUrl).toString() : "";
      const recheck = next
        ? isSafeWebhookUrl(next)
        : { valid: false, reason: "Redirect blocked" as const };
      if (!recheck.valid) {
        clearTimeout(timeoutId);
        return {
          success: false,
          error: `Security blocked webhook redirect: ${recheck.reason || "unsafe Location"}`,
          timestamp: new Date().toISOString(),
        };
      }
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        error: `Webhook returned HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      statusCode: response.status,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    const isAbort = error?.name === "AbortError";
    return {
      success: false,
      error: isAbort ? "Webhook request timed out after 12s" : error?.message || "Network error",
      timestamp: new Date().toISOString(),
    };
  }
}
