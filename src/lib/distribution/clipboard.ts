/**
 * Safe Distribution Utilities
 *
 * LUNVO intentionally does NOT use unofficial LinkedIn APIs or automation
 * browser extensions to post content, as these frequently lead to account bans.
 * Instead, we use safe OS-level distribution methods.
 */

export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

export async function copyAndOpenLinkedIn(content: string): Promise<boolean> {
  const ok = await copyToClipboard(content);
  if (ok) {
    // 1 tap: copy + open LinkedIn composer
    window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank", "noopener,noreferrer");
  }
  return ok;
}

export async function shareViaWebShare(content: string, files?: File[]): Promise<boolean> {
  const data: ShareData = { text: content, title: "LUNVO Post" };
  if (files && files.length > 0 && navigator.canShare?.({ files })) {
    (data as { files: File[] }).files = files;
  }
  if (navigator.share && navigator.canShare?.(data)) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      // User cancelled is not an error
      if ((error as Error)?.name === "AbortError") return false;
      console.error("Web Share failed:", error);
      return false;
    }
  }
  return false;
}

export function generateICS(content: string, scheduledDate?: string): string {
  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dtStart = scheduledDate
    ? new Date(scheduledDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    : dtStamp;
  const dtEnd =
    new Date(new Date(scheduledDate || now).getTime() + 30 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";
  const summary = content.split("\n")[0]?.slice(0, 60) || "LUNVO Post";
  const description = content
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .slice(0, 800);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LUNVO//Post Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:lunvo-${Date.now()}@lunvo.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary.replace(/,/g, "\\,")}`,
    `DESCRIPTION:${description}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(
  content: string,
  scheduledDate?: string,
  filename = "lunvo-post.ics"
): void {
  const ics = generateICS(content, scheduledDate);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface WebhookPayload {
  platform: "linkedin" | "twitter" | "newsletter";
  content: string | string[];
  scheduledDate?: string; // ISO String
}

import { isSafeWebhookUrl } from "@/lib/scheduler/webhookDispatcher";

export async function dispatchToWebhook(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<boolean> {
  const check = isSafeWebhookUrl(webhookUrl);
  if (!check.valid) {
    console.warn("Blocked unsafe webhook dispatch URL:", check.reason);
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error("Webhook dispatch failed:", error);
    return false;
  }
}
