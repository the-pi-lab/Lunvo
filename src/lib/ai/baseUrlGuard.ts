/**
 * Shared SSRF guard for user-supplied AI baseURLs.
 * Lives here (not in a route file) because Next.js route modules may only
 * export HTTP handlers — extra exports break `next build` type-checking.
 */
import { isSafeWebhookUrl } from "@/lib/scheduler/webhookDispatcher";

const LOCAL_PROVIDERS = new Set(["ollama", "lmstudio", "llamacpp", "jan"]);

export function isLoopbackUrl(raw: string): boolean {
  try {
    const h = new URL(raw.trim()).hostname.toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "::1" || h.endsWith(".localhost");
  } catch {
    return false;
  }
}

/**
 * Validate a custom baseURL. Local providers are restricted to loopback
 * (closes the `provider: "ollama"` exemption hole); everything else must
 * pass the shared SSRF validator.
 */
export function validateModelBaseURL(
  provider: unknown,
  baseURL: unknown
): { ok: true } | { ok: false; error: string } {
  if (typeof baseURL !== "string" || baseURL.trim().length === 0) return { ok: true };
  if (baseURL.length > 500) return { ok: false, error: "baseURL too long" };
  if (typeof provider === "string" && LOCAL_PROVIDERS.has(provider)) {
    if (!isLoopbackUrl(baseURL)) {
      return { ok: false, error: "Local providers must use a localhost baseURL" };
    }
    return { ok: true };
  }
  const check = isSafeWebhookUrl(baseURL);
  if (!check.valid) return { ok: false, error: "Restricted or invalid baseURL target" };
  return { ok: true };
}
