// ============================================================================
// Local storage helpers
// All wrapped in try/catch since SSR has no `window` and Safari private
// mode can throw on storage access.
// ============================================================================

import type { ThemePreference } from "@/types";

const THEME_KEY = "false9:theme";
const ADMIN_AUTH_KEY = "false9:admin-auth";
const ONBOARDED_KEY = "false9:onboarded";

export function getStoredTheme(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

export function setStoredTheme(theme: ThemePreference) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function getHasOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ONBOARDED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setHasOnboarded() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDED_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function getAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdminAuthed(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ADMIN_AUTH_KEY, value ? "true" : "false");
  } catch {
    /* ignore */
  }
}
