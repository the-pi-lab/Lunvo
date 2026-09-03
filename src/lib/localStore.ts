/**
 * Local-First Store (Phase 19-A)
 * Auth destroyed — everything lives in localStorage.
 * Drafts, Creator Persona, Daily Usage.
 */

import { AIProfile } from "./ai/types";
import { getProviderDef } from "./ai/providers/registry";

/* ---------------- Generic helpers ---------------- */

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to persist key "${key}" to localStorage:`, error);
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------- Drafts ---------------- */

export interface LocalDraft {
  id: string;
  content: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  source: "created" | "analyzed" | "manual";
}

const DRAFTS_KEY = "lunvo_drafts";

export function getDrafts(): LocalDraft[] {
  return read<LocalDraft[]>(DRAFTS_KEY, []).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function saveDraft(
  content: string,
  source: LocalDraft["source"] = "manual",
  title?: string
): LocalDraft {
  const drafts = read<LocalDraft[]>(DRAFTS_KEY, []);
  const now = new Date().toISOString();
  const firstLine = content.trim().split("\n")[0] ?? "Untitled draft";
  const draft: LocalDraft = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `draft-${crypto.randomUUID()}`
        : `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    content,
    title:
      title ||
      (firstLine.length > 60 ? `${firstLine.slice(0, 60)}...` : firstLine || "Untitled draft"),
    createdAt: now,
    updatedAt: now,
    source,
  };
  drafts.push(draft);
  write(DRAFTS_KEY, drafts);
  return draft;
}

export function updateDraft(id: string, content: string): void {
  const drafts = read<LocalDraft[]>(DRAFTS_KEY, []);
  const idx = drafts.findIndex((d) => d.id === id);
  if (idx !== -1) {
    drafts[idx]!.updatedAt = new Date().toISOString();
    drafts[idx]!.content = content;
    write(DRAFTS_KEY, drafts);
  }
}

export function deleteDraft(id: string): void {
  write(
    DRAFTS_KEY,
    read<LocalDraft[]>(DRAFTS_KEY, []).filter((d) => d.id !== id)
  );
}

export function deleteDraftsBulk(ids: string[]): void {
  const idSet = new Set(ids);
  write(
    DRAFTS_KEY,
    read<LocalDraft[]>(DRAFTS_KEY, []).filter((d) => !idSet.has(d.id))
  );
}

/* ---------------- Creator Persona ---------------- */

export interface CreatorPersona {
  role: string;
  tone: string;
  goal: string;
  audience: string;
}

const PERSONA_KEY = "lunvo_persona";

export const DEFAULT_PERSONA: CreatorPersona = {
  role: "Founder & Builder",
  tone: "Bold, direct, story-driven",
  goal: "Build audience & authority",
  audience: "Founders, developers, indie hackers",
};

export function getPersona(): CreatorPersona {
  return read<CreatorPersona>(PERSONA_KEY, DEFAULT_PERSONA);
}

export function savePersona(persona: CreatorPersona): void {
  write(PERSONA_KEY, persona);
}

/** Human-readable context block for AI prompts. */
export function getPersonaContext(): string {
  const p = getPersona();
  return `Writer context — Role: ${p.role}. Tone: ${p.tone}. Goal: ${p.goal}. Audience: ${p.audience}.`;
}

/* ---------------- Daily Usage (replaces CreditBadge) ---------------- */

export interface DailyUsage {
  date: string;
  analyze: number;
  generate: number;
}

const USAGE_KEY = "lunvo_usage";

export function getUsage(): DailyUsage {
  const usage = read<DailyUsage>(USAGE_KEY, { date: todayKey(), analyze: 0, generate: 0 });
  if (usage.date !== todayKey()) {
    const reset: DailyUsage = { date: todayKey(), analyze: 0, generate: 0 };
    write(USAGE_KEY, reset);
    return reset;
  }
  return usage;
}

export function incrementUsage(kind: "analyze" | "generate"): DailyUsage {
  const usage = getUsage();
  usage[kind] += 1;
  write(USAGE_KEY, usage);
  return usage;
}

/* ---------------- Live Engagement (Phase 21) ---------------- */

const LAST_ER_KEY = "lunvo_last_er";
const LAST_HOOK_KEY = "lunvo_last_hook";

export function getLastER(): number | null {
  return read<number | null>(LAST_ER_KEY, null);
}
export function setLastER(er: number): void {
  write(LAST_ER_KEY, er);
}
export function getLastHook(): number | null {
  return read<number | null>(LAST_HOOK_KEY, null);
}
export function setLastHook(hook: number): void {
  write(LAST_HOOK_KEY, hook);
}

/* ---------------- Active provider chip ---------------- */

export function getActiveProviderChip(): { name: string; model: string; color: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("lunvo_ai_profiles");
    const activeId = window.localStorage.getItem("lunvo_ai_active_profile");
    const vault = raw ? (JSON.parse(raw) as AIProfile[]) : [];
    const active = vault.find((p) => p.id === activeId) ?? vault[0];
    if (!active) return null;
    const def = getProviderDef(active.provider);
    return {
      name: def?.name ?? active.provider,
      model: active.model,
      color: def?.color ?? "#004AC6",
    };
  } catch {
    return null;
  }
}
