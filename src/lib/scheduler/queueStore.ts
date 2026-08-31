/**
 * LUNVO 2.0 — Scheduler Queue Store
 * Manages upcoming scheduled posts and webhook destinations in local storage.
 */

import type { ScheduledPost, WebhookConfig } from "./types";

const SCHEDULED_QUEUE_KEY = "lunvo_scheduled_queue_v2";
const WEBHOOK_CONFIGS_KEY = "lunvo_webhook_configs_v2";

const DEFAULT_WEBHOOKS: WebhookConfig[] = [
  {
    id: "default-zapier",
    name: "Zapier LinkedIn Zap",
    platform: "zapier",
    url: "",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-make",
    name: "Make.com Scenario",
    platform: "make",
    url: "",
    isActive: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-buffer",
    name: "Buffer Publisher",
    platform: "buffer",
    url: "",
    isActive: false,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Retrieves all scheduled posts from storage.
 */
export function getScheduledQueue(): ScheduledPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SCHEDULED_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScheduledPost[];
  } catch (e) {
    console.error("Failed to load scheduled queue:", e);
    return [];
  }
}

/**
 * Adds or updates a scheduled post.
 */
export function saveScheduledPost(post: ScheduledPost): void {
  if (typeof window === "undefined") return;
  try {
    const queue = getScheduledQueue();
    const index = queue.findIndex((p) => p.id === post.id);
    if (index >= 0) {
      queue[index] = post;
    } else {
      queue.unshift(post);
    }
    localStorage.setItem(SCHEDULED_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Failed to save scheduled post:", e);
  }
}

/**
 * Removes or cancels a scheduled post.
 */
export function deleteScheduledPost(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const queue = getScheduledQueue();
    const filtered = queue.filter((p) => p.id !== id);
    localStorage.setItem(SCHEDULED_QUEUE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete scheduled post:", e);
  }
}

/**
 * Updates status of a post.
 */
export function updatePostStatus(
  id: string,
  status: ScheduledPost["status"],
  error?: string
): void {
  if (typeof window === "undefined") return;
  const queue = getScheduledQueue();
  const target = queue.find((p) => p.id === id);
  if (target) {
    target.status = status;
    if (status === "dispatched") {
      target.lastDispatchedAt = new Date().toISOString();
      target.errorMessage = undefined;
    } else if (status === "failed") {
      target.errorMessage = error || "Dispatch failed";
      target.retryCount = (target.retryCount || 0) + 1;
    }
    localStorage.setItem(SCHEDULED_QUEUE_KEY, JSON.stringify(queue));
  }
}

/**
 * Retrieves due posts (scheduledTime <= current time and status === "queued").
 */
export function getDuePosts(): ScheduledPost[] {
  const queue = getScheduledQueue();
  const now = new Date().getTime();
  return queue.filter((p) => {
    if (p.status !== "queued") return false;
    const targetTime = new Date(p.scheduledTime).getTime();
    return targetTime <= now;
  });
}

/**
 * Retrieves configured webhooks.
 */
export function getWebhookConfigs(): WebhookConfig[] {
  if (typeof window === "undefined") return DEFAULT_WEBHOOKS;
  try {
    const raw = localStorage.getItem(WEBHOOK_CONFIGS_KEY);
    if (!raw) {
      localStorage.setItem(WEBHOOK_CONFIGS_KEY, JSON.stringify(DEFAULT_WEBHOOKS));
      return DEFAULT_WEBHOOKS;
    }
    return JSON.parse(raw) as WebhookConfig[];
  } catch (e) {
    console.error("Failed to load webhook configs:", e);
    return DEFAULT_WEBHOOKS;
  }
}

/**
 * Saves webhook configs.
 */
export function saveWebhookConfigs(configs: WebhookConfig[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WEBHOOK_CONFIGS_KEY, JSON.stringify(configs));
  } catch (e) {
    console.error("Failed to save webhook configs:", e);
  }
}
