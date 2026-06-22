import type { Difficulty, GameMode } from "@/types";

export interface ModeMeta {
  id: GameMode;
  label: string;
  description: string;
  emoji: string;
}

/** Only 4 core modes shown in the UI */
export const GAME_MODES: ModeMeta[] = [
  { id: "player",  label: "Player Mode",  description: "Guess the footballer",      emoji: "⚽" },
  { id: "club",    label: "Club Mode",    description: "Guess the club or nation",   emoji: "🛡️" },
  { id: "manager", label: "Manager Mode", description: "Guess the manager",          emoji: "📋" },
  { id: "mixed",   label: "Mixed Mode",   description: "Players, clubs & managers",  emoji: "🔀" },
];

export interface FilterGroup {
  label: string;
  options: string[];
}

/** Filters shown depend on the selected mode — no cross-contamination */
export const FILTER_GROUPS_BY_MODE: Record<string, FilterGroup[]> = {
  player: [
    {
      label: "League",
      options: ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1"],
    },
    {
      label: "Competition",
      options: ["Champions League Clubs", "World Cup", "World Cup Winners"],
    },
    {
      label: "Era",
      options: ["Current Players", "Legends"],
    },
  ],
  club: [
    {
      label: "Type",
      options: [
        "Premier League Clubs",
        "Top European Clubs",
        "Champions League Clubs",
        "National Teams",
      ],
    },
  ],
  manager: [
    {
      label: "Era",
      options: ["Current Managers", "Historic Managers"],
    },
    {
      label: "Achievement",
      options: ["Champions League Winners", "World Cup Winners"],
    },
  ],
  mixed: [
    {
      label: "Players",
      options: [
        "Premier League",
        "La Liga",
        "Bundesliga",
        "Serie A",
        "Ligue 1",
        "Legends",
        "Current Players",
      ],
    },
    {
      label: "Clubs",
      options: ["Premier League Clubs", "Top European Clubs", "National Teams"],
    },
    {
      label: "Managers",
      options: ["Current Managers", "Historic Managers"],
    },
  ],
};

export const DIFFICULTIES: { id: Difficulty; label: string; description: string }[] = [
  { id: "easy",       label: "Easy",       description: "Clear hint for the False 9" },
  { id: "medium",     label: "Medium",     description: "Vague hint"                 },
  { id: "hard",       label: "Hard",       description: "Very abstract hint"         },
  { id: "impossible", label: "Impossible", description: "No hint at all"             },
];
