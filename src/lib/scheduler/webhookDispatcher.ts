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
export function isSafeWebhookUrl(urlString: string): { valid: boolean; reason?: string } {
  try {
    if (!urlString || typeof urlString !== "string") {
      return { valid: false, reason: "URL is empty or invalid" };
    }

    const trimmed = urlString.trim();
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { valid: false, reason: "Only HTTP/HTTPS webhook protocols are permitted" };
    }

    const hostname = url.hostname.toLowerCase();

    // Block loopback, link-local, and cloud metadata endpoints
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname === "169.254.169.254" ||
      hostname === "metadata.google.internal" ||
      hostname.startsWith("169.254.") ||
      hostname.startsWith("0.") ||
      hostname.includes("::ffff:127.") ||
      hostname.includes("::ffff:169.254.")
    ) {
      return {
        valid: false,
        reason: "Internal loopback and metadata endpoints are blocked for security",
      };
    }

    // Check for hex, octal, or integer IP representations
    if (/^(0x[0-9a-f]+|\d+)$/i.test(hostname)) {
      return { valid: false, reason: "Numeric or encoded IP representations are blocked" };
    }

    // Block private subnets in production
    const isPrivateIpv4 =
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname);

    if (isPrivateIpv4 && process.env.NODE_ENV === "production") {
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
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "LUNVO-Webhook-Dispatcher/2.0",
        "X-Lunvo-Delivery-Timestamp": new Date().toISOString(),
        "X-Lunvo-Post-Id": post.id,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

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
