/**
 * Phase 19 — Voice DNA Storage (local-first, connector-pluggable)
 * Wraps src/lib/voice-dna/memory.ts so call sites can import from
 * @/lib/ai/voiceDna/storage.
 * Local-first: ALWAYS writes local. Connector (LUNVO_DNA_CONNECTOR_URL or
 * NEXT_PUBLIC_DNA_CONNECTOR_URL) is best-effort mirror, never sole store.
 */
import type { VoiceDNA } from "./types";
import {
  getVoiceDNA as getLocalVoiceDNA,
  saveVoiceDNA as saveLocalVoiceDNA,
} from "@/lib/voice-dna/memory";

function getConnectorUrl(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return (
    process.env.LUNVO_DNA_CONNECTOR_URL?.trim() ||
    process.env.NEXT_PUBLIC_DNA_CONNECTOR_URL?.trim() ||
    undefined
  );
}

export async function getVoiceDNA(): Promise<VoiceDNA | null> {
  const connectorUrl = getConnectorUrl();
  if (connectorUrl) {
    try {
      const res = await fetch(connectorUrl, { method: "GET", cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as VoiceDNA;
        if (data && typeof data === "object") return data;
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
  // Always persist locally first (no split-brain)
  saveLocalVoiceDNA(dna);
  const connectorUrl = getConnectorUrl();
  if (connectorUrl) {
    try {
      await fetch(connectorUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dna),
      });
    } catch {
      // best-effort mirror only
    }
  }
}

export function saveVoiceDNASync(dna: VoiceDNA): void {
  saveLocalVoiceDNA(dna);
}
