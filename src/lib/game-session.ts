// ============================================================================
// Game session storage — holds the *current* round in sessionStorage so the
// /create wizard can generate it and the /play screen can pick it up, even
// across a full page navigation. This is intentionally simple (no React
// Context) so it survives refreshes during a long pass-the-phone session.
// ============================================================================

import type { GameRound } from "@/types";

const KEY = "false9:current-round";

export function saveRound(round: GameRound) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(round));
  } catch {
    /* ignore */
  }
}

export function loadRound(): GameRound | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameRound) : null;
  } catch {
    return null;
  }
}

export function clearRound() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
