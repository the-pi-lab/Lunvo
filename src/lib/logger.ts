/**
 * LUNVO Logger v1 - Phase 08
 * Lightweight structured logger. No external deps (pino-ready).
 * Usage: logger.info("message", { extra }), logger.error("msg", error, { ctx })
 * In production, outputs JSON for log aggregation. In dev, pretty console.
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getEnvLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL || process.env.NEXT_PUBLIC_LOG_LEVEL || "").toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") return raw;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[getEnvLevel()];
}

function formatError(err: unknown): Record<string, unknown> | string {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack?.split("\n").slice(0, 5).join(" | "),
    };
  }
  if (typeof err === "string") return err;
  try {
    return JSON.parse(JSON.stringify(err));
  } catch {
    return String(err);
  }
}

function baseMeta(level: LogLevel, context?: LogContext) {
  return {
    timestamp: new Date().toISOString(),
    level,
    ...context,
  };
}

function prettyPrint(level: LogLevel, message: string, meta?: LogContext, err?: unknown) {
  const isProd = process.env.NODE_ENV === "production";
  const payload = {
    ...baseMeta(level, meta),
    msg: message,
    ...(err !== undefined ? { error: formatError(err) } : {}),
  };

  if (isProd) {
    // JSON for log aggregation (Vercel, Railway, etc.)
    const line = JSON.stringify(payload);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
    return;
  }

  // Dev: pretty
  const prefix = `[${payload.timestamp}] ${level.toUpperCase()}`;
  const ctxStr = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  const line = `${prefix} ${message}${ctxStr}`;
  if (level === "error") console.error(line, err ?? "");
  else if (level === "warn") console.warn(line, err ?? "");
  else if (level === "debug") console.debug(line, err ?? "");
  else console.log(line, err ?? "");
}

export const logger = {
  debug: (msg: string, ctx?: LogContext, err?: unknown) => {
    if (!shouldLog("debug")) return;
    prettyPrint("debug", msg, ctx, err);
  },
  info: (msg: string, ctx?: LogContext) => {
    if (!shouldLog("info")) return;
    prettyPrint("info", msg, ctx);
  },
  warn: (msg: string, ctx?: LogContext, err?: unknown) => {
    if (!shouldLog("warn")) return;
    prettyPrint("warn", msg, ctx, err);
  },
  error: (msg: string, err?: unknown, ctx?: LogContext) => {
    if (!shouldLog("error")) return;
    prettyPrint("error", msg, ctx, err);
  },
};

// Request-scoped helper - use in API routes
export function getRequestId(
  req?: Request | { headers: { get: (k: string) => string | null } }
): string {
  try {
    // Try to reuse incoming header (Vercel, Cloudflare)
    const hdr = (
      req as unknown as { headers?: { get?: (k: string) => string | null } }
    )?.headers?.get?.("x-request-id");
    if (hdr) return hdr;
  } catch {}
  // Fallback random
  try {
    // @ts-ignore - crypto.randomUUID available in Node 19+
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
      return crypto.randomUUID().slice(0, 8);
  } catch {}
  return Math.random().toString(36).slice(2, 10);
}

export type Logger = typeof logger;
