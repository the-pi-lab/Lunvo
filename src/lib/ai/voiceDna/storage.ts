/**
 * Phase 19 — Voice DNA Storage (local-first, connector-pluggable)
 * Wraps src/lib/voice-dna/memory.ts so call sites can import from
 * @/lib/ai/voiceDna/storage (as PLAN specifies: storage.ts:1)
 * No Supabase. If LUNVO_DNA_CONNECTOR_URL is set, delegate there.
 */
import type { VoiceDNA } from "./types";
import {
  getVoiceDNA as getLocalVoiceDNA,
  saveVoiceDNA as saveLocalVoiceDNA,
} from "@/lib/voice-dna/memory";

export async function getVoiceDNA(): Promise<VoiceDNA | null> {
  // Future: if connector URL is set, fetch from there
  const connectorUrl =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_DNA_CONNECTOR_URL : undefined;
  if (connectorUrl) {
    try {
      const res = await fetch(connectorUrl, { method: "GET", cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as VoiceDNA;
        return data;
      }
    } catch {
      // fall through to local
    }
  }
  return getLocalVoiceDNA();
}

export function getVoiceDNASync(): VoiceDNA | null {
  return getLocalVoiceDNA();
}

export async function saveVoiceDNA(dna: VoiceDNA): Promise<void> {
  const connectorUrl =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_DNA_CONNECTOR_URL : undefined;
  if (connectorUrl) {
    try {
      await fetch(connectorUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dna),
      });
      return;
    } catch {
      // fallback
    }
  }
  saveLocalVoiceDNA(dna);
}

export function saveVoiceDNASync(dna: VoiceDNA): void {
  saveLocalVoiceDNA(dna);
}
