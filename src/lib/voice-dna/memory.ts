/**
 * Voice DNA Local Memory
 * Self-evolving post bank stored in localStorage.
 * 10 posts = trainable, 30 = elite clone strength.
 */

export const MIN_POSTS = 10;
export const MAX_POSTS = 30;
const POSTS_KEY = "lunvo-dna-posts";
const DNA_KEY = "lunvo-voice-dna";

export interface StoredPost {
  id: string;
  content: string;
  addedAt: string;
  wordCount: number;
}

export type EngineTier = "empty" | "collecting" | "trainable" | "sharp" | "elite";

export interface EngineStats {
  totalPosts: number;
  totalWords: number;
  avgWords: number;
  strengthPercent: number;
  tier: EngineTier;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function hashContent(content: string): string {
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) + hash + content.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

export function getPosts(): StoredPost[] {
  if (typeof window === "undefined") return [];
  try {
    return safeParse<StoredPost[]>(window.localStorage.getItem(POSTS_KEY), []);
  } catch {
    return [];
  }
}

function savePosts(posts: StoredPost[]): void {
  window.localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function addPost(content: string): { ok: boolean; error?: string } {
  const trimmed = content.trim();
  const words = trimmed.split(/\s+/).filter(Boolean).length;

  if (words < 20)
    return {
      ok: false,
      error: "Post too short - minimum 20 words so the engine can learn real patterns.",
    };

  const posts = getPosts();
  if (posts.length >= MAX_POSTS)
    return { ok: false, error: `Memory full at ${MAX_POSTS} posts. Remove one to add another.` };

  const hash = hashContent(trimmed);
  if (posts.some((p) => p.id === hash))
    return { ok: false, error: "This post is already in memory." };

  posts.unshift({
    id: hash,
    content: trimmed,
    addedAt: new Date().toISOString(),
    wordCount: words,
  });
  savePosts(posts);
  return { ok: true };
}

export function removePost(id: string): void {
  savePosts(getPosts().filter((p) => p.id !== id));
}

export function clearAllPosts(): void {
  savePosts([]);
}

export function getEngineStats(posts?: StoredPost[]): EngineStats {
  const list = posts ?? getPosts();
  const totalWords = list.reduce((acc, p) => acc + p.wordCount, 0);
  const totalPosts = list.length;
  const avgWords = totalPosts > 0 ? Math.round(totalWords / totalPosts) : 0;

  let tier: EngineTier = "empty";
  if (totalPosts >= MAX_POSTS) tier = "elite";
  else if (totalPosts >= 20) tier = "sharp";
  else if (totalPosts >= MIN_POSTS) tier = "trainable";
  else if (totalPosts > 0) tier = "collecting";

  return {
    totalPosts,
    totalWords,
    avgWords,
    strengthPercent: Math.min(100, Math.round((totalPosts / MAX_POSTS) * 100)),
    tier,
  };
}

export function getTierLabel(tier: EngineTier): string {
  switch (tier) {
    case "elite":
      return "Elite Clone";
    case "sharp":
      return "Sharp Profile";
    case "trainable":
      return "Trainable - Ready";
    case "collecting":
      return `Collecting - ${MIN_POSTS} needed to train`;
    default:
      return "Empty Memory";
  }
}

export function saveTrainedDna(dna: unknown): void {
  window.localStorage.setItem(
    DNA_KEY,
    JSON.stringify({ dna, trainedAt: new Date().toISOString(), postCount: getPosts().length })
  );
}

export interface TrainedDnaRecord {
  dna: Record<string, unknown>;
  trainedAt: string;
  postCount: number;
}

export function getTrainedDna(): TrainedDnaRecord | null {
  if (typeof window === "undefined") return null;
  try {
    return safeParse<TrainedDnaRecord | null>(window.localStorage.getItem(DNA_KEY), null);
  } catch {
    return null;
  }
}

export function hasTrainedDna(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(DNA_KEY));
}

/* ---------------- VoiceDNA bridge (Phase 19) ---------------- */

import type { VoiceDNA } from "@/lib/ai/voiceDna/types";

function coerceVoiceDNA(raw: Record<string, unknown>): VoiceDNA | null {
  try {
    const r = raw as Partial<VoiceDNA> & {
      tone?: unknown;
      formatting_preferences?: unknown;
      vocabulary?: unknown;
      sentence_structure?: unknown;
    };
    if (!r.tone || !r.formatting_preferences || !r.vocabulary || !r.sentence_structure) return null;
    return {
      id: (r.id as string) ?? "local-voice-dna",
      tone: Array.isArray(r.tone) ? (r.tone as string[]) : [],
      formatting_preferences: r.formatting_preferences as VoiceDNA["formatting_preferences"],
      vocabulary: r.vocabulary as VoiceDNA["vocabulary"],
      sentence_structure: r.sentence_structure as VoiceDNA["sentence_structure"],
      last_updated: (r.last_updated as string) ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Phase 19 — getVoiceDNA() local-first.
 * Returns null if no trained DNA. If connector URL is set, caller can delegate
 * there instead (future). For now localStorage is source of truth.
 */
export function getVoiceDNA(): VoiceDNA | null {
  const record = getTrainedDna();
  if (!record) return null;
  const coerced = coerceVoiceDNA(record.dna as Record<string, unknown>);
  if (coerced) {
    // attach last_updated from record if missing
    if (!coerced.last_updated) coerced.last_updated = record.trainedAt;
    return coerced;
  }
  // Fallback: try raw shape
  return null;
}

/** Save VoiceDNA via tuner (Phase 19 slider → next gen). */
export function saveVoiceDNA(dna: VoiceDNA): void {
  saveTrainedDna({
    ...dna,
    last_updated: new Date().toISOString(),
  });
}
