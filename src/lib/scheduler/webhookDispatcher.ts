/**
 * LUNVO 2.0 — Outbound Webhook Dispatcher
 * Dispatches scheduled posts to Zapier, Make.com, Buffer, or Custom Webhooks safely.
 */

import type { ScheduledPost, OutboundPayload, DispatchResult } from "./types";
import { updatePostStatus } from "./queueStore";

export function buildOutboundPayload(post: ScheduledPost): OutboundPayload {
  const content = post.content || "";
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;

  // Extract hashtags from content if any
  const hashtagMatches = content.match(/#[a-zA-Z0-9_]+/g) || [];
  const tags = Array.from(new Set([...(post.tags || []), ...hashtagMatches]));

  return {
    event: "lunvo.post.publish",
    postId: post.id,
    title: post.title || "LinkedIn Post",
    content,
    criticScore: post.criticScore,
    humanScore: post.humanScore,
    characterCount: chars,
    wordCount: words,
    tags,
    scheduledTime: post.scheduledTime,
    dispatchedAt: new Date().toISOString(),
    carouselPdfBase64: post.carouselPdfBase64,
    meta: {
      source: post.source || "lunvo_studio",
      version: "2.0.0",
    },
  };
}

/**
 * Dispatches a post to its configured webhook endpoint.
 */
export async function dispatchScheduledPost(
  post: ScheduledPost,
  overrideWebhookUrl?: string
): Promise<DispatchResult> {
  const targetUrl = overrideWebhookUrl || post.targetWebhookUrl;

  if (!targetUrl || !targetUrl.trim()) {
    const errorMsg = "No webhook URL configured for dispatch";
    updatePostStatus(post.id, "failed", errorMsg);
    return {
      success: false,
      error: errorMsg,
      dispatchedAt: new Date().toISOString(),
    };
  }

  const payload = buildOutboundPayload(post);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "LUNVO-Dispatcher/2.0",
        "X-Lunvo-Event": "post.publish",
        "X-Lunvo-Post-Id": post.id,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok || res.status === 200 || res.status === 201 || res.status === 204) {
      updatePostStatus(post.id, "dispatched");
      return {
        success: true,
        statusCode: res.status,
        dispatchedAt: new Date().toISOString(),
      };
    } else {
      const bodyText = await res.text().catch(() => "");
      const errorMsg = `HTTP Error ${res.status}: ${bodyText.slice(0, 200)}`;
      updatePostStatus(post.id, "failed", errorMsg);
      return {
        success: false,
        statusCode: res.status,
        responseBody: bodyText,
        error: errorMsg,
        dispatchedAt: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    const errorMsg =
      error?.name === "AbortError"
        ? "Webhook request timed out (12s)"
        : error?.message || "Network Error";
    updatePostStatus(post.id, "failed", errorMsg);
    return {
      success: false,
      error: errorMsg,
      dispatchedAt: new Date().toISOString(),
    };
  }
}
