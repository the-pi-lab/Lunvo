/**
 * LUNVO 2.0 — Local Scheduler Cron Engine
 * Runs background loop to dispatch due posts automatically.
 */

import { getDuePosts, getWebhookConfigs } from "./queueStore";
import { dispatchScheduledPost } from "./webhookDispatcher";

let cronTimer: NodeJS.Timeout | null = null;
let isExecuting = false;

/**
 * Checks queue and dispatches any due posts.
 */
export async function runSchedulerTick(): Promise<{ checked: number; dispatched: number }> {
  if (isExecuting) return { checked: 0, dispatched: 0 };
  isExecuting = true;

  try {
    const duePosts = getDuePosts();
    if (duePosts.length === 0) {
      return { checked: 0, dispatched: 0 };
    }

    const webhooks = getWebhookConfigs();
    const activeWebhook = webhooks.find((w) => w.isActive && w.url);

    let dispatchedCount = 0;
    for (const post of duePosts) {
      const targetUrl = post.targetWebhookUrl || activeWebhook?.url;
      if (targetUrl) {
        const result = await dispatchScheduledPost(post, targetUrl);
        if (result.success) dispatchedCount++;
      }
    }

    return { checked: duePosts.length, dispatched: dispatchedCount };
  } finally {
    isExecuting = false;
  }
}

/**
 * Starts the automatic scheduler loop (runs every 30 seconds).
 */
export function startSchedulerLoop(intervalMs = 30000): void {
  if (typeof window === "undefined" && typeof setInterval === "undefined") return;
  if (cronTimer) return;

  // Run immediately once
  runSchedulerTick().catch((e) => console.error("Scheduler tick failed:", e));

  // Set recurring interval
  cronTimer = setInterval(() => {
    runSchedulerTick().catch((e) => console.error("Scheduler tick failed:", e));
  }, intervalMs);
}

/**
 * Stops the scheduler loop.
 */
export function stopSchedulerLoop(): void {
  if (cronTimer) {
    clearInterval(cronTimer);
    cronTimer = null;
  }
}
