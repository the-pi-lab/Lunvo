/**
 * LUNVO 2.0 — Scheduler & Outbound Webhook Engine Types
 */

export type PostDispatchStatus = "queued" | "dispatched" | "failed" | "cancelled";

export type WebhookPlatform = "zapier" | "make" | "buffer" | "custom";

export interface WebhookConfig {
  id: string;
  name: string;
  platform: WebhookPlatform;
  url: string;
  secretToken?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  criticScore?: number;
  humanScore?: number;
  tags?: string[];
  scheduledTime: string; // ISO string e.g. "2026-09-01T09:00:00.000Z"
  status: PostDispatchStatus;
  targetWebhookId?: string;
  targetWebhookUrl?: string;
  carouselPdfBase64?: string;
  retryCount: number;
  maxRetries: number;
  lastDispatchedAt?: string;
  errorMessage?: string;
  createdAt: string;
  source: "workflow" | "studio" | "telegram" | "manual";
}

export interface OutboundPayload {
  event: "lunvo.post.publish" | "lunvo.post.scheduled";
  postId: string;
  title?: string;
  content: string;
  criticScore?: number;
  humanScore?: number;
  characterCount: number;
  wordCount: number;
  tags: string[];
  scheduledTime: string;
  dispatchedAt: string;
  carouselPdfBase64?: string;
  meta: {
    source: string;
    version: string;
  };
}

export interface DispatchResult {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  error?: string;
  dispatchedAt: string;
}
