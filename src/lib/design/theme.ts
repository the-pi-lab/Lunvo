/**
 * Theme Engine (Phase 18 - Light Aurora)
 * LUNVO is light-only by design. Dark is intentionally not offered.
 * Engine kept minimal for future extensibility.
 */

export type Theme = "light";

const STORAGE_KEY = "lunvo-theme";

export function getActiveTheme(): Theme {
  return "light";
}

export function applyTheme(_theme: Theme = "light"): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", "light");
}

export function setTheme(_theme: Theme = "light"): void {
  applyTheme("light");
}

export function initTheme(): Theme {
  applyTheme("light");
  return "light";
}
