/**
 * Re-export for external connector integrations.
 * Users who don't want local storage can implement RateLimitConnector
 * against their own backend (e.g., self-hosted Redis, Cloudflare KV, etc.)
 * and set LUNVO_RATE_LIMIT_CONNECTOR_URL to a POST endpoint.
 *
 * POST { key, limit, windowMs } -> RateLimitResult
 */
export type { RateLimitConnector, RateLimitResult } from "@/lib/ai/serverLimiter";
export { getRateLimitConnector, checkRateLimit } from "@/lib/ai/serverLimiter";
