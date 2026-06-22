// ============================================================================
// Game Logic — pure, framework-free functions for generating False9 rounds.
// Keep all game rules here so they're easy to test and easy to extend
// (e.g. multiplayer later can reuse this exact module server-side).
// ============================================================================

import type {
  Difficulty,
  GameEntity,
  GameFilters,
  GameMode,
  GameRound,
  PlayerRole,
} from "@/types";
import { getAllClubs, getAllManagers, getAllPlayers } from "@/lib/data-pack-loader";

/** Simple seeded-free shuffle (Fisher-Yates). */
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Pick a random integer in [0, max). */
function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/** Returns the entity pool relevant to a given mode + filters.
 * `extraEntities` lets callers fold in client-side custom/admin entries
 * (stored in localStorage) without touching the bundled data packs. */
export function getEntityPool(
  mode: GameMode,
  filters: GameFilters,
  extraEntities: GameEntity[] = []
): GameEntity[] {
  let pool: GameEntity[] = [];
  const allPlayers = getAllPlayers().concat(extraEntities.filter((e) => e.type === "player"));
  const allClubs = getAllClubs().concat(extraEntities.filter((e) => e.type === "club"));
  const allManagers = getAllManagers().concat(extraEntities.filter((e) => e.type === "manager"));

  if (mode === "player") pool = allPlayers;
  else if (mode === "club") pool = allClubs;
  else if (mode === "manager") pool = allManagers;
  else {
    // mixed, chaos, double-false9, hard, impossible, tournament all draw
    // from whatever entity types the user selected (default: all three).
    const types = filters.entityTypes.length ? filters.entityTypes : ["player", "club", "manager"];
    if (types.includes("player")) pool = pool.concat(allPlayers);
    if (types.includes("club")) pool = pool.concat(allClubs);
    if (types.includes("manager")) pool = pool.concat(allManagers);
  }

  if (filters.categories.length > 0) {
    pool = pool.filter((e) => e.categories.some((c) => filters.categories.includes(c)));
  }

  return pool;
}

/** Resolves a mode to its effective difficulty default (user can still override). */
export function defaultDifficultyForMode(mode: GameMode): Difficulty {
  switch (mode) {
    case "hard":
      return "hard";
    case "impossible":
      return "impossible";
    default:
      return "medium";
  }
}

/** Returns the hint text for a given entity + difficulty. */
export function getHintForDifficulty(entity: GameEntity, difficulty: Difficulty): string {
  switch (difficulty) {
    case "easy":
      return entity.hintEasy;
    case "medium":
      return entity.hintMedium;
    case "hard":
      return entity.hintHard;
    case "impossible":
      return "No hint — good luck!";
  }
}

/** How many False9 imposters a mode should assign. */
export function false9CountForMode(mode: GameMode, numPlayers: number): number {
  if (mode === "double-false9") return 2;
  // Chaos mode randomly picks 1 or 2 imposters for unpredictability.
  if (mode === "chaos") return Math.random() < 0.5 && numPlayers >= 5 ? 2 : 1;
  return 1;
}

/**
 * Generates a brand-new game round: picks an entity, assigns roles, and
 * builds the per-player reveal text. Pure function — no side effects.
 */
export function generateGameRound(params: {
  mode: GameMode;
  difficulty: Difficulty;
  filters: GameFilters;
  playerNames: string[];
  extraEntities?: GameEntity[];
}): GameRound {
  const { mode, difficulty, filters, playerNames, extraEntities = [] } = params;
  const numPlayers = playerNames.length;

  const pool = getEntityPool(mode, filters, extraEntities);
  if (pool.length === 0) {
    throw new Error("No entities match the selected filters. Try widening your filters.");
  }
  const entity = pool[randInt(pool.length)];

  const false9Count = Math.min(false9CountForMode(mode, numPlayers), numPlayers - 1);
  const shuffledIndices = shuffle(Array.from({ length: numPlayers }, (_, i) => i));
  const false9Indices = shuffledIndices.slice(0, false9Count);

  const hint = getHintForDifficulty(entity, difficulty);

  const roles: PlayerRole[] = playerNames.map((name, i) => {
    const isFalse9 = false9Indices.includes(i);
    return {
      playerIndex: i,
      playerName: name,
      isFalse9,
      revealText: isFalse9 ? hint : entity.name,
      hasSeenReveal: false,
    };
  });

  return {
    id: `round-${Date.now()}-${randInt(100000)}`,
    mode,
    difficulty,
    entity,
    numPlayers,
    playerNames,
    roles,
    false9Indices,
    currentRevealIndex: 0,
    phase: "reveal",
    votes: {},
  };
}

/** Tallies votes and returns the player index (or indices, on a tie) with the most votes. */
export function tallyVotes(round: GameRound): { winners: number[]; counts: Record<number, number> } {
  const counts: Record<number, number> = {};
  Object.values(round.votes).forEach((votedFor) => {
    counts[votedFor] = (counts[votedFor] || 0) + 1;
  });
  let max = 0;
  Object.values(counts).forEach((c) => {
    if (c > max) max = c;
  });
  const winners = Object.keys(counts)
    .map(Number)
    .filter((idx) => counts[idx] === max);
  return { winners, counts };
}

/** Did the group correctly catch (all of) the False9 imposter(s)? */
export function didGroupWin(round: GameRound): boolean {
  const { winners } = tallyVotes(round);
  if (winners.length !== 1) return false; // a tie means the imposter escaped
  return round.false9Indices.includes(winners[0]);
}
