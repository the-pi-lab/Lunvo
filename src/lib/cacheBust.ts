/**
 * Cache-bust utilities (FIX-C)
 * Local mode me purane Supabase session keys browser ko login-loop me fasate the.
 * Ye util unhe boot pe safely purge karta hai - sirf local mode me, real users safe.
 */

import { isLocalMode } from "./localMode";

export const APP_VERSION = "2.0.0";

const AUTH_KEY_PATTERNS = ["sb-", "supabase.auth.token"];

function isStaleAuthKey(key: string): boolean {
  // @supabase/ssr keys: sb-<project-ref>-auth-token, sb-...-auth-token.0/.1, code-verifier
  if (key.startsWith("sb-") && key.includes("auth-token")) return true;
  if (key === "supabase.auth.token") return true;
  return false;
}

export function purgeStaleAuthKeys(): string[] {
  if (typeof window === "undefined") return [];
  if (!isLocalMode()) return []; // logged-in Supabase users: hands off

  const removed: string[] = [];
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && isStaleAuthKey(key)) toRemove.push(key);
    }
    toRemove.forEach((k) => {
      window.localStorage.removeItem(k);
      removed.push(k);
    });
    if (removed.length > 0) {
      console.info(`[lunvo cache-bust] purged ${removed.length} stale auth key(s)`);
    }
  } catch {
    // storage blocked - ignore
  }
  return removed;
}

/** Call once on app mount. */
export function runBootMaintenance(): void {
  purgeStaleAuthKeys();
}
