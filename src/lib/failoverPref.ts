/**
 * Failover preference (Phase 17b)
 * Stored in localStorage. Read by unified router, toggled by FailoverToggle UI.
 */

const KEY = "lunvo_failover_enabled";

export function isFailoverEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = window.localStorage.getItem(KEY);
    return val === null ? true : val === "true";
  } catch {
    return true;
  }
}

export function setFailoverEnabled(enabled: boolean): void {
  window.localStorage.setItem(KEY, String(enabled));
}
