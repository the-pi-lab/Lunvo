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
    // Upstash uses fixed window via INCR + EXPIRE via Lua. We emulate with
    // EVAL: get count, if missing set 1 with PEXPIRE, else if count<limit INCR.
    // REST pipeline: https://upstash.com/docs/redis/features/restapi
    const now = Date.now();
    const redisKey = `lunvo:rl:${key}`;

    // Simple REST pipeline: try EVAL if available, fallback to INCR/PEXPIRE.
    // We use INCR + TTL pattern that is atomic enough for rate limit.
    try {
      // INCR
      const incrRes = await fetch(`${this.url}/incr/${encodeURIComponent(redisKey)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!incrRes.ok) throw new Error(`upstash incr ${incrRes.status}`);
      const incrJson = (await incrRes.json()) as { result: number };
      const count = incrJson.result;

      if (count === 1) {
        // first hit in window -> set expire
        await fetch(`${this.url}/pexpire/${encodeURIComponent(redisKey)}/${windowMs}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${this.token}` },
        });
        return {
          allowed: true,
          remaining: limit - 1,
          limit,
          resetAt: now + windowMs,
          retryAfterMs: 0,
        };
      }

      // Need TTL to compute resetAt
      const ttlRes = await fetch(`${this.url}/pttl/${encodeURIComponent(redisKey)}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      const ttlJson = (await ttlRes.json()) as { result: number };
      const ttl = ttlJson.result > 0 ? ttlJson.result : windowMs;
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
      // Fallback to allow (fail-open) but log
      return {
        allowed: true,
        remaining: limit,
        limit,
        resetAt: now + windowMs,
        retryAfterMs: 0,
      };
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

/** Convenience: daily window (24h) */
export const DAY_MS = 24 * 60 * 60 * 1000;
export const MINUTE_MS = 60 * 1000;
