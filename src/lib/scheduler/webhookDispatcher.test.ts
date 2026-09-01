import { describe, it, expect, beforeEach } from "vitest";
import { buildOutboundPayload } from "./webhookDispatcher";
import {
  saveScheduledPost,
  getScheduledQueue,
  deleteScheduledPost,
  updatePostStatus,
  getDuePosts,
} from "./queueStore";
import type { ScheduledPost } from "./types";

describe("LUNVO 2.0 Webhook Dispatcher & Queue Engine", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("constructs a valid outbound webhook payload with tags and word metrics", () => {
    const post: ScheduledPost = {
      id: "test-post-1",
      title: "How to scale AI pipelines",
      content: "Here is why 90% of engineers fail at AI workflows. #AI #Engineering #Nextjs",
      criticScore: 94,
      humanScore: 92,
      scheduledTime: "2026-09-01T09:00:00.000Z",
      status: "queued",
      retryCount: 0,
      maxRetries: 3,
      createdAt: "2026-08-31T20:00:00.000Z",
      source: "studio",
    };

    const payload = buildOutboundPayload(post);
    expect(payload.event).toBe("lunvo.post.publish");
    expect(payload.postId).toBe("test-post-1");
    expect(payload.wordCount).toBeGreaterThan(5);
    expect(payload.characterCount).toBe(post.content.length);
    expect(payload.criticScore).toBe(94);
    expect(payload.tags).toContain("#AI");
    expect(payload.tags).toContain("#Engineering");
    expect(payload.tags).toContain("#Nextjs");
  });

  it("handles scheduled post queue lifecycle (save, status update, delete)", () => {
    const post: ScheduledPost = {
      id: "test-queue-2",
      title: "Tech Trends 2026",
      content: "Content to dispatch",
      scheduledTime: "2026-09-02T10:00:00.000Z",
      status: "queued",
      retryCount: 0,
      maxRetries: 3,
      createdAt: "2026-08-31T20:00:00.000Z",
      source: "workflow",
    };

    saveScheduledPost(post);
    let queue = getScheduledQueue();
    expect(queue.length).toBe(1);
    expect(queue[0]?.id).toBe("test-queue-2");

    updatePostStatus("test-queue-2", "dispatched");
    queue = getScheduledQueue();
    expect(queue[0]?.status).toBe("dispatched");
    expect(queue[0]?.lastDispatchedAt).toBeDefined();

    deleteScheduledPost("test-queue-2");
    queue = getScheduledQueue();
    expect(queue.length).toBe(0);
  });

  it("accurately identifies due posts based on timestamp", () => {
    const pastPost: ScheduledPost = {
      id: "due-post-1",
      title: "Past Post",
      content: "Due now",
      scheduledTime: new Date(Date.now() - 5000).toISOString(),
      status: "queued",
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      source: "studio",
    };

    const futurePost: ScheduledPost = {
      id: "future-post-2",
      title: "Future Post",
      content: "Due tomorrow",
      scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      status: "queued",
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      source: "studio",
    };

    saveScheduledPost(pastPost);
    saveScheduledPost(futurePost);

    const due = getDuePosts();
    expect(due.length).toBe(1);
    expect(due[0]?.id).toBe("due-post-1");
  });

  it("blocks dangerous SSRF destinations (loopback, metadata, invalid schemes)", async () => {
    const { isSafeWebhookUrl } = await import("./webhookDispatcher");

    expect(isSafeWebhookUrl("http://127.0.0.1/api").valid).toBe(false);
    expect(isSafeWebhookUrl("http://localhost:3000/hook").valid).toBe(false);
    expect(isSafeWebhookUrl("http://169.254.169.254/latest/meta-data/").valid).toBe(false);
    expect(isSafeWebhookUrl("file:///etc/passwd").valid).toBe(false);
    expect(isSafeWebhookUrl("javascript:alert(1)").valid).toBe(false);

    expect(isSafeWebhookUrl("https://hooks.zapier.com/hooks/catch/123/abc").valid).toBe(true);
    expect(isSafeWebhookUrl("https://hook.eu1.make.com/xyz123").valid).toBe(true);
  });
});
