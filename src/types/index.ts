// ============================================================================
// False9 — Core Type Definitions
// Keep this file as the single source of truth for shared shapes.
// ============================================================================

/** The three entity categories a data pack can provide. */
export type EntityCategory = "player" | "club" | "manager";

/** Difficulty controls which hint field is shown to the False9. */
export type Difficulty = "easy" | "medium" | "hard" | "impossible";

/** A single guessable entity (footballer, club, or manager). */
export interface GameEntity {
  id: string;
  name: string;
  type: EntityCategory;
  hintEasy: string;
  hintMedium: string;
  hintHard: string;
  /** Free-form tags used by filters, e.g. "Premier League", "Legends". */
  categories: string[];
  /** Optional emoji / short badge shown on cards for flavor. */
  badge?: string;
}

/** Shape of each players.json / clubs.json / managers.json file. */
export type EntityFile = GameEntity[];

/** A self-contained content bundle that can be merged at runtime. */
export interface DataPack {
  id: string;
  name: string;
  description: string;
  players: GameEntity[];
  clubs: GameEntity[];
  managers: GameEntity[];
}

/** Game modes supported by the MVP. Logic differences are described inline. */
export type GameMode =
  | "player"
  | "club"
  | "manager"
  | "mixed"
  | "chaos"
  | "double-false9"
  | "hard"
  | "impossible"
  | "tournament";

/** Filter selection made on the "Select Filters" screen. */
export interface GameFilters {
  categories: string[]; // matches GameEntity.categories
  entityTypes: EntityCategory[]; // which of player/club/manager to draw from
}

/** Per-player role assignment for a single round. */
export interface PlayerRole {
  playerIndex: number;
  playerName: string;
  isFalse9: boolean;
  /** What this player sees on their reveal screen. */
  revealText: string;
  hasSeenReveal: boolean;
}

/** Full state of one generated game round. */
export interface GameRound {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
  entity: GameEntity;
  numPlayers: number;
  playerNames: string[];
  roles: PlayerRole[];
  false9Indices: number[];
  currentRevealIndex: number;
  phase: "reveal" | "discussion" | "voting" | "results";
  votes: Record<number, number>; // voterIndex -> votedForIndex
}

/** Persisted theme preference. */
export type ThemePreference = "dark" | "light";
