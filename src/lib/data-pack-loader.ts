// ============================================================================
// Data Pack Loader
// ----------------------------------------------------------------------------
// Loads every data pack under /src/data-packs and merges them into one
// in-memory dataset. To add a new pack:
//   1. Create /src/data-packs/<your-pack>/{manifest,players,clubs,managers}.json
//   2. Add the folder name to PACK_IDS below.
// That's it — no other code needs to change.
// ============================================================================

import type { DataPack, GameEntity } from "@/types";

import baseManifest from "@/data-packs/base-pack/manifest.json";
import basePlayers from "@/data-packs/base-pack/players.json";
import baseClubs from "@/data-packs/base-pack/clubs.json";
import baseManagers from "@/data-packs/base-pack/managers.json";

import legendsManifest from "@/data-packs/legends-pack/manifest.json";
import legendsPlayers from "@/data-packs/legends-pack/players.json";
import legendsClubs from "@/data-packs/legends-pack/clubs.json";
import legendsManagers from "@/data-packs/legends-pack/managers.json";

import worldCupManifest from "@/data-packs/world-cup-pack/manifest.json";
import worldCupPlayers from "@/data-packs/world-cup-pack/players.json";
import worldCupClubs from "@/data-packs/world-cup-pack/clubs.json";
import worldCupManagers from "@/data-packs/world-cup-pack/managers.json";

/**
 * Register every available pack here. Each entry statically imports its
 * JSON files so Next.js can bundle them — no runtime file-system access
 * needed, which keeps this safe to call from client components too.
 */
const ALL_PACKS: DataPack[] = [
  {
    ...baseManifest,
    players: basePlayers as GameEntity[],
    clubs: baseClubs as GameEntity[],
    managers: baseManagers as GameEntity[],
  },
  {
    ...legendsManifest,
    players: legendsPlayers as GameEntity[],
    clubs: legendsClubs as GameEntity[],
    managers: legendsManagers as GameEntity[],
  },
  {
    ...worldCupManifest,
    players: worldCupPlayers as GameEntity[],
    clubs: worldCupClubs as GameEntity[],
    managers: worldCupManagers as GameEntity[],
  },
];

/** Returns the list of registered packs (for the admin UI / future toggles). */
export function getAllPacks(): DataPack[] {
  return ALL_PACKS;
}

/** Merges every pack's entities of a given type into one flat array. */
function mergeByType(type: "players" | "clubs" | "managers"): GameEntity[] {
  return ALL_PACKS.flatMap((pack) => pack[type]);
}

/** All players across every installed pack. */
export function getAllPlayers(): GameEntity[] {
  return mergeByType("players");
}

/** All clubs across every installed pack. */
export function getAllClubs(): GameEntity[] {
  return mergeByType("clubs");
}

/** All managers across every installed pack. */
export function getAllManagers(): GameEntity[] {
  return mergeByType("managers");
}

/** Every entity (players + clubs + managers) merged into one list. */
export function getAllEntities(): GameEntity[] {
  return [...getAllPlayers(), ...getAllClubs(), ...getAllManagers()];
}

/** Distinct category tags found across all entities, sorted alphabetically. */
export function getAllCategories(): string[] {
  const set = new Set<string>();
  getAllEntities().forEach((e) => e.categories.forEach((c) => set.add(c)));
  return Array.from(set).sort();
}
