/**
 * LUNVO 2.0 — Workflow Store & Registry
 * LocalStorage persistence, template seeding, and JSON export/import.
 */

import type { Workflow } from "./types";
import { PREBUILT_WORKFLOWS } from "./templates";

const WORKFLOWS_STORAGE_KEY = "lunvo_custom_workflows";
const ACTIVE_WORKFLOW_KEY = "lunvo_active_workflow_id";

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
    const custom: Workflow[] = JSON.parse(raw);
    // Combine prebuilts with custom, ensuring IDs are unique
    const customMap = new Map<string, Workflow>();
    custom.forEach((w) => customMap.set(w.metadata.id, w));
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

  storage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(all));
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
  const parsed = JSON.parse(jsonString) as Workflow;
  if (!parsed.metadata?.id || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Invalid LUNVO workflow JSON format");
  }
  // Assign a unique ID if imported
  parsed.metadata.id = `imported-${Date.now()}`;
  parsed.metadata.isPrebuilt = false;
  parsed.metadata.createdAt = new Date().toISOString();
  parsed.metadata.updatedAt = new Date().toISOString();

  saveWorkflow(parsed);
  return parsed;
}
