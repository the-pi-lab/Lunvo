/**
 * Local/Demo Mode — single source of truth.
 * Active when Supabase env vars are absent (or NEXT_PUBLIC_DEMO_MODE=1).
 * In local mode the app runs fully offline: no auth, no DB, instant UI.
 */

export function isLocalMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "1") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.trim() === "";
}

export interface LocalProfile {
  id: string;
  full_name: string;
  email: string;
  plan: string;
}

export function getLocalProfile(): LocalProfile {
  return {
    id: "local-commander",
    full_name: "Local Commander",
    email: "you@localhost",
    plan: "offline",
  };
}
