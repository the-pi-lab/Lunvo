/**
 * LUNVO 2.0 — Workflow Store & Registry
 * LocalStorage persistence, template seeding, and JSON export/import.
 */

import type { Workflow } from "./types";
import { PREBUILT_WORKFLOWS } from "./templates";

const WORKFLOWS_STORAGE_KEY = "lunvo_custom_workflows";
const QUARANTINE_KEY = "lunvo_custom_workflows_quarantine";
const ACTIVE_WORKFLOW_KEY = "lunvo_active_workflow_id";

function isValidWorkflow(w: unknown): w is Workflow {
  if (!w || typeof w !== "object") return false;
  const m = (w as Workflow).metadata;
  const n = (w as Workflow).nodes;
  const e = (w as Workflow).edges;
  return (
    typeof m?.id === "string" &&
    m.id.length > 0 &&
    Array.isArray(n) &&
    Array.isArray(e) &&
    n.every(
      (node) =>
        node &&
        typeof node.id === "string" &&
        typeof node.type === "string" &&
        Number.isFinite(node.position?.x) &&
        Number.isFinite(node.position?.y)
    )
  );
}

function sanitizeWorkflow(w: Workflow): Workflow {
  const nodes = w.nodes.map((n) => ({
    ...n,
    position: {
      x: Number.isFinite(n.position?.x) ? n.position.x : 120,
      y: Number.isFinite(n.position?.y) ? n.position.y : 120,
    },
  }));
  const ids = new Set(nodes.map((n) => n.id));
  return {
    ...w,
    nodes,
    // Prune dangling edges (point at deleted/missing nodes) — they render
    // nothing and silently break graph traversal expectations
    edges: w.edges.filter(
      (e) =>
        e &&
        typeof e.source === "string" &&
        typeof e.target === "string" &&
        ids.has(e.source) &&
        ids.has(e.target)
    ),
  };
}

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Retrieves all available workflows (prebuilt + custom).
 */
export function getAllWorkflows(): Workflow[] {
  const storage = getStorage();
  if (!storage) return PREBUILT_WORKFLOWS;

  try {
    const raw = storage.getItem(WORKFLOWS_STORAGE_KEY);
    if (!raw) {
      // Seed prebuilts
      storage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(PREBUILT_WORKFLOWS));
      return PREBUILT_WORKFLOWS;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("workflow store is not an array");
    // Per-item validation: quarantine bad entries, never wipe good customs
    const customMap = new Map<string, Workflow>();
    const bad: unknown[] = [];
    parsed.forEach((w) => {
      if (isValidWorkflow(w)) customMap.set(w.metadata.id, sanitizeWorkflow(w));
      else bad.push(w);
    });
    if (bad.length > 0) {
      try {
        storage.setItem(QUARANTINE_KEY, JSON.stringify(bad).slice(0, 50000));
      } catch {
        // quarantine best-effort only
      }
    }
    PREBUILT_WORKFLOWS.forEach((p) => {
      if (!customMap.has(p.metadata.id)) customMap.set(p.metadata.id, p);
    });
    return Array.from(customMap.values());
  } catch {
    return PREBUILT_WORKFLOWS;
  }
}

/**
 * Gets a specific workflow by its ID.
 */
export function getWorkflowById(id: string): Workflow | undefined {
  const all = getAllWorkflows();
  return all.find((w) => w.metadata.id === id);
}

/**
 * Gets the currently active workflow ID.
 */
export function getActiveWorkflowId(): string {
  const storage = getStorage();
  if (!storage) return "classic-3agent-storyteller";
  return storage.getItem(ACTIVE_WORKFLOW_KEY) || "classic-3agent-storyteller";
}

/**
 * Sets the active workflow ID.
 */
export function setActiveWorkflowId(id: string): void {
  const storage = getStorage();
  if (storage) {
    storage.setItem(ACTIVE_WORKFLOW_KEY, id);
  }
}

/**
 * Saves or updates a workflow.
 */
export function saveWorkflow(workflow: Workflow): void {
  const storage = getStorage();
  if (!storage) return;

  const all = getAllWorkflows();
  const index = all.findIndex((w) => w.metadata.id === workflow.metadata.id);
  const updated = {
    ...workflow,
    metadata: {
      ...workflow.metadata,
      updatedAt: new Date().toISOString(),
    },
  };

  if (index >= 0) {
    all[index] = updated;
  } else {
    all.push(updated);
  }

  try {
    storage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // QuotaExceeded etc: keep in-memory state, surface via return
    throw new Error("Workflow could not be saved (browser storage full or unavailable)");
  }
}

/**
 * Deletes a custom workflow. Prebuilt workflows are protected.
 */
export function deleteWorkflow(id: string): boolean {
  const storage = getStorage();
  if (!storage) return false;

  const all = getAllWorkflows();
  const target = all.find((w) => w.metadata.id === id);
  if (!target || target.metadata.isPrebuilt) return false;

  const filtered = all.filter((w) => w.metadata.id !== id);
  storage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Exports a workflow to a downloadable JSON string.
 */
export function exportWorkflowToJson(workflow: Workflow): string {
  return JSON.stringify(workflow, null, 2);
}

/**
 * Imports a workflow from a JSON string.
 */
export function importWorkflowFromJson(jsonString: string): Workflow {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("File is not valid JSON");
  }
  if (!isValidWorkflow(parsed)) {
    throw new Error("Invalid LUNVO workflow JSON format (needs metadata.id, nodes[], edges[])");
  }
  const clean = sanitizeWorkflow(parsed);
  // Assign a unique ID if imported
  clean.metadata.id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `imported-${crypto.randomUUID()}`
      : `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  clean.metadata.isPrebuilt = false;
  clean.metadata.createdAt = new Date().toISOString();
  clean.metadata.updatedAt = new Date().toISOString();

  saveWorkflow(clean);
  return clean;
}
