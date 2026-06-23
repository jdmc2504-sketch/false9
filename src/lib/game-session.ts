// ============================================================================
// Game Session Storage
// Holds the current round in sessionStorage so /create and /play can share it.
// Also stores last-used settings so Play Again can regenerate instantly.
// ============================================================================

import type { Difficulty, EntityCategory, GameMode, GameRound } from "@/types";

const ROUND_KEY         = "false9:current-round";
const LAST_SETTINGS_KEY = "false9:last-settings";

// ── Current round ────────────────────────────────────────────────────────────

export function saveRound(round: GameRound) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(ROUND_KEY, JSON.stringify(round)); } catch { /* ignore */ }
}

export function loadRound(): GameRound | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ROUND_KEY);
    return raw ? (JSON.parse(raw) as GameRound) : null;
  } catch { return null; }
}

export function clearRound() {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.removeItem(ROUND_KEY); } catch { /* ignore */ }
}

// ── Last-used settings (for "Play Again with same settings") ─────────────────

export interface LastGameSettings {
  mode: GameMode;
  difficulty: Difficulty;
  categories: string[];
  entityTypes: EntityCategory[];
  playerNames: string[];
}

export function saveLastSettings(settings: LastGameSettings) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LAST_SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export function loadLastSettings(): LastGameSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LAST_SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as LastGameSettings) : null;
  } catch { return null; }
}
