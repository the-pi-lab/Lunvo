/**
 * Phase 18 — Serverless Limiter (Local-First + Pluggable Connector)
 * No Supabase. Default = in-memory (single-instance) + localStore daily.
 * If user provides UPSTASH_REDIS_REST_URL/TOKEN, uses Upstash via REST (distributed).
 * If user provides custom connector (via env CONNECTOR_URL), delegates there.
 *
 * BYOK path (profile / vault) is EXEMPT — caller must skip this module.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number; // epoch ms when window resets
  retryAfterMs: number;
}

export interface RateLimitConnector {
  /** Atomically check + increment. Must be serverless-safe if distributed. */
  check(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

/* ---------------- Memory connector (default, local-first) ---------------- */

type MemEntry = { count: number; resetAt: number };

class MemoryConnector implements RateLimitConnector {
  private store = new Map<string, MemEntry>();

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now >= existing.resetAt) {
      const resetAt = now + windowMs;
      this.store.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: limit - 1,
        limit,
        resetAt,
        retryAfterMs: 0,
      };
    }

    if (existing.count < limit) {
      existing.count += 1;
      return {
        allowed: true,
        remaining: limit - existing.count,
        limit,
        resetAt: existing.resetAt,
        retryAfterMs: 0,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      limit,
      resetAt: existing.resetAt,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    };
  }

  /** For tests: clear state */
  _clear() {
    this.store.clear();
  }
}

/* ---------------- Upstash REST connector (distributed, optional) ---------------- */

class UpstashConnector implements RateLimitConnector {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url.replace(/\/+$/, "");
    this.token = token;
  }

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const redisKey = `lunvo:rl:${key}`;

    try {
      // Execute INCR and PTTL together via Upstash pipeline for atomic evaluation
      const pipeRes = await fetch(`${this.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["PTTL", redisKey],
        ]),
      });

      if (!pipeRes.ok) throw new Error(`upstash pipeline ${pipeRes.status}`);
      const results = (await pipeRes.json()) as Array<{ result: number }>;
      const count = results[0]?.result ?? 1;
      let ttl = results[1]?.result ?? -1;

      // If key has no expiration set (first hit or ttl expired/missing), set it now
      if (ttl <= 0) {
        await fetch(`${this.url}/pexpire/${encodeURIComponent(redisKey)}/${windowMs}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${this.token}` },
        });
        ttl = windowMs;
      }

      const resetAt = now + ttl;

      if (count <= limit) {
        return {
          allowed: true,
          remaining: limit - count,
          limit,
          resetAt,
          retryAfterMs: 0,
        };
      }

      return {
        allowed: false,
        remaining: 0,
        limit,
        resetAt,
        retryAfterMs: ttl,
      };
    } catch {
      // Self-host default: fail-open in dev (local-first), fail-closed in prod
      // so an Upstash outage can't silently grant unlimited paid inference.
      const prod = process.env.NODE_ENV === "production";
      return prod
        ? { allowed: false, remaining: 0, limit, resetAt: now + windowMs, retryAfterMs: windowMs }
        : { allowed: true, remaining: limit, limit, resetAt: now + windowMs, retryAfterMs: 0 };
    }
  }
}

/* ---------------- Custom connector (user's own backend) ---------------- */

class CustomConnector implements RateLimitConnector {
  private endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }
  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, limit, windowMs }),
    });
    if (!res.ok) throw new Error(`connector ${res.status}`);
    return (await res.json()) as RateLimitResult;
  }
}

/* ---------------- Factory ---------------- */

let singleton: RateLimitConnector | null = null;

function getEnv(name: string): string {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : "";
}

export function getRateLimitConnector(): RateLimitConnector {
  if (singleton) return singleton;

  const upstashUrl = getEnv("UPSTASH_REDIS_REST_URL");
  const upstashToken = getEnv("UPSTASH_REDIS_REST_TOKEN");
  const customUrl = getEnv("LUNVO_RATE_LIMIT_CONNECTOR_URL");

  if (customUrl) {
    singleton = new CustomConnector(customUrl);
    return singleton;
  }
  if (upstashUrl && upstashToken) {
    singleton = new UpstashConnector(upstashUrl, upstashToken);
    return singleton;
  }
  singleton = new MemoryConnector();
  return singleton;
}

/** Test helper: reset singleton + memory */
export function _resetConnectorForTest() {
  singleton = null;
}

/**
 * Main helper for server plan-mode.
 * key = e.g. `nvidia_deepseek` or `user:${userId}:generate` or `ip:${ip}:analyze-public`
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const connector = getRateLimitConnector();
  return connector.check(key, limit, windowMs);
}

/**
 * Extracts a secure client IP address from request headers.
 */
export function extractClientIp(req: {
  headers: { get: (name: string) => string | null };
}): string {
  // Cloudflare
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim()) return cfIp.trim();

  // Standard reverse proxy
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();

  // Vercel / AWS ALB
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp && vercelIp.trim()) return vercelIp.split(",")[0]!.trim();

  // Forwarded for header (take leftmost)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded && forwarded.trim()) {
    const firstIp = forwarded.split(",")[0]!.trim();
    if (firstIp) return firstIp;
  }

  return "127.0.0.1";
}

/** Convenience: daily and minute windows */
export const DAY_MS = 24 * 60 * 60 * 1000;
export const MINUTE_MS = 60 * 1000;
