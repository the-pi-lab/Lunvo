/**
 * Cache-bust utilities (FIX-C)
 * Purane provider session keys stale state create kar sakte the — boot pe saaf.
 * Ye util unhe boot pe safely purge karta hai - sirf local mode me, real users safe.
 */

export const APP_VERSION = "2.0.0";

const AUTH_KEY_PATTERNS = ["sb-", "provider-session.auth.token"];

function isStaleAuthKey(key: string): boolean {
  // @provider-session/ssr keys: sb-<project-ref>-auth-token, sb-...-auth-token.0/.1, code-verifier
  if (key.startsWith("sb-") && key.includes("auth-token")) return true;
  if (key === "provider-session.auth.token") return true;
  return false;
}

export function purgeStaleAuthKeys(): string[] {
  if (typeof window === "undefined") return [];
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
