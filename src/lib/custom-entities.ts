// ============================================================================
// Custom Entities Store
// ----------------------------------------------------------------------------
// The admin panel lets a user add/edit/delete entities without a backend.
// Since the bundled data packs are static JSON shipped with the build, we
// can't write to them from the browser. Instead, admin edits are kept as a
// "custom pack" in localStorage and merged into the pool at game-generation
// time (see game-logic/engine.ts `extraEntities`). Use the Export button to
// turn these into a real data-pack JSON file you can commit to the repo.
// ============================================================================

import type { GameEntity } from "@/types";

const KEY = "false9:custom-entities";

export function getCustomEntities(): GameEntity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameEntity[]) : [];
  } catch {
    return [];
  }
}

function save(entities: GameEntity[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entities));
  } catch {
    /* ignore quota errors */
  }
}

export function addCustomEntity(entity: GameEntity) {
  const all = getCustomEntities();
  save([...all, entity]);
}

export function updateCustomEntity(id: string, updates: Partial<GameEntity>) {
  const all = getCustomEntities();
  save(all.map((e) => (e.id === id ? { ...e, ...updates } : e)));
}

export function deleteCustomEntity(id: string) {
  const all = getCustomEntities();
  save(all.filter((e) => e.id !== id));
}

export function replaceAllCustomEntities(entities: GameEntity[]) {
  save(entities);
}

export function makeNewEntityId(type: GameEntity["type"]) {
  return `custom-${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
