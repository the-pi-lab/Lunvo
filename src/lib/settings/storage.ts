import { AIProfile } from "../ai/types";

const LUNVO_PROFILE_KEY = "lunvo_ai_profile";

/**
 * Legacy single-profile helpers (Phase 19-A: auth destroyed, storage local-only).
 * New code should use profileVault. Kept for backward compatibility.
 */
export async function saveProfileToStorage(profile: AIProfile): Promise<void> {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LUNVO_PROFILE_KEY, JSON.stringify(profile));
}

export async function loadProfileFromStorage(): Promise<AIProfile | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LUNVO_PROFILE_KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw) as AIProfile;
    if (profile.apiKey === "REDACTED_LOCAL_ONLY") return null;
    return profile;
  } catch {
    return null;
  }
}
