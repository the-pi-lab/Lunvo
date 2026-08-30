/**
 * Profile Vault (Phase 17b)
 * Multiple AI profiles saved in priority order + auto-failover.
 * Ek provider ki limit khatam -> request automatically next pe shift.
 */

import { AIProfile } from "./types";
import { getProviderDef } from "./providers/registry";

const VAULT_KEY = "lunvo_ai_profiles";
const ACTIVE_KEY = "lunvo_ai_active_profile";
const LEGACY_KEY = "lunvo_ai_profile";

export function makeProfileId(provider: string): string {
  return `${provider}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isLocalOrCustomProvider(provider: string): boolean {
  return provider === "ollama" || provider === "lmstudio" || provider === "custom";
}

/** Migrates the old single-profile storage into the vault (once). */
function migrateLegacy(): AIProfile[] {
  if (typeof window === "undefined") return [];
  const legacy = safeParse<AIProfile | null>(window.localStorage.getItem(LEGACY_KEY), null);
  if (legacy && legacy.provider && (legacy.apiKey || isLocalOrCustomProvider(legacy.provider))) {
    const first: AIProfile = { ...legacy, id: makeProfileId(legacy.provider) };
    const vault: AIProfile[] = [first];
    window.localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
    window.localStorage.setItem(ACTIVE_KEY, first.id!);
    window.localStorage.removeItem(LEGACY_KEY);
    return vault;
  }
  return [];
}

export function getVault(): AIProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VAULT_KEY);
    if (raw === null) return migrateLegacy();
    const vault = safeParse<AIProfile[]>(raw, []);
    return vault.filter((p) => p.provider && (p.apiKey || isLocalOrCustomProvider(p.provider)));
  } catch {
    return [];
  }
}

function saveVault(vault: AIProfile[]): void {
  window.localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
}

export function getActiveProfile(): AIProfile | null {
  if (typeof window === "undefined") return null;
  const vault = getVault();
  if (vault.length === 0) return null;
  const activeId = window.localStorage.getItem(ACTIVE_KEY);
  return vault.find((p) => p.id === activeId) ?? vault[0] ?? null;
}

export function setActiveProfileId(id: string): void {
  window.localStorage.setItem(ACTIVE_KEY, id);
}

export function getActiveProfileId(): string | null {
  if (typeof window === "undefined") return null;
  const vault = getVault();
  if (vault.length === 0) return null;
  const activeId = window.localStorage.getItem(ACTIVE_KEY);
  if (activeId && vault.some((p) => p.id === activeId)) return activeId;
  return vault[0]?.id ?? null;
}

export function addToVault(profile: AIProfile): { ok: boolean; error?: string } {
  const isLocal = isLocalOrCustomProvider(profile.provider);
  if (!profile.provider || (!profile.apiKey && !isLocal)) {
    return { ok: false, error: "Provider and API key are required." };
  }
  const vault = getVault();
  const dupe = vault.find((p) => p.provider === profile.provider && p.model === profile.model);
  if (dupe) return { ok: false, error: "Same provider + model already in vault." };

  const def = getProviderDef(profile.provider);
  const entry: AIProfile = {
    ...profile,
    id: profile.id || makeProfileId(profile.provider),
    label: profile.label || def?.name || profile.provider,
  };
  vault.push(entry);
  saveVault(vault);
  if (vault.length === 1) setActiveProfileId(entry.id!);
  return { ok: true };
}

export function removeFromVault(id: string): void {
  const vault = getVault().filter((p) => p.id !== id);
  saveVault(vault);
  if (getActiveProfileId() === id) {
    const next = vault[0]?.id;
    if (next) setActiveProfileId(next);
    else window.localStorage.removeItem(ACTIVE_KEY);
  }
}

export function updateInVault(id: string, patch: Partial<AIProfile>): void {
  const vault = getVault().map((p) => (p.id === id ? { ...p, ...patch } : p));
  saveVault(vault);
}

/** Drag-and-drop reorder: move id to targetIndex within the vault. */
export function reorderVault(id: string, targetIndex: number): AIProfile[] {
  const vault = getVault();
  const from = vault.findIndex((p) => p.id === id);
  if (from === -1) return vault;
  const clamped = Math.max(0, Math.min(targetIndex, vault.length - 1));
  const [moved] = vault.splice(from, 1);
  vault.splice(clamped, 0, moved!);
  saveVault(vault);
  return vault;
}

export function clearVault(): void {
  saveVault([]);
  window.localStorage.removeItem(ACTIVE_KEY);
}

/**
 * Failover-eligible errors: rate limits, quota/payment, server errors, timeouts.
 * Auth errors (401/403) are NOT failover-worthy — key is wrong, next provider
 * won't fix a typo in this one.
 */
export function isFailoverEligible(error: unknown): boolean {
  if (error && typeof error === "object" && "statusCode" in error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 429 || status === 402 || status === 408) return true;
    if (status !== undefined && status >= 500) return true;
  }
  const msg = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("429") ||
    msg.includes("timeout") ||
    msg.includes("temporarily") ||
    msg.includes("overloaded")
  );
}
