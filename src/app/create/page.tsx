"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { GAME_MODES, FILTER_GROUPS_BY_MODE, DIFFICULTIES } from "@/lib/mode-meta";
import { generateGameRound } from "@/game-logic/engine";
import { getCustomEntities } from "@/lib/custom-entities";
import { saveRound, saveLastSettings } from "@/lib/game-session";
import type { Difficulty, EntityCategory, GameMode } from "@/types";

type Step = "mode" | "filters" | "difficulty" | "players";
const STEPS: Step[] = ["mode", "filters", "difficulty", "players"];

const STEP_LABELS: Record<Step, string> = {
  mode:       "01 — Mode",
  filters:    "02 — Filters",
  difficulty: "03 — Difficulty",
  players:    "04 — Players",
};

const MODE_ENTITY_TYPES: Record<GameMode, EntityCategory[]> = {
  player:          ["player"],
  club:            ["club"],
  manager:         ["manager"],
  mixed:           ["player", "club", "manager"],
  chaos:           ["player", "club", "manager"],
  "double-false9": ["player", "club", "manager"],
  hard:            ["player", "club", "manager"],
  impossible:      ["player", "club", "manager"],
  tournament:      ["player", "club", "manager"],
};

export default function CreateGamePage() {
  const router = useRouter();

  const [stepIndex, setStepIndex]     = useState(0);
  const [mode, setMode]               = useState<GameMode | null>(null);
  const [categories, setCategories]   = useState<string[]>([]);
  const [difficulty, setDifficulty]   = useState<Difficulty>("medium");
  const [playerNames, setPlayerNames] = useState(["Player 1", "Player 2", "Player 3"]);
  const [error, setError]             = useState<string | null>(null);

  const step = STEPS[stepIndex];

  function selectMode(m: GameMode) {
    setMode(m);
    setCategories([]); // clear filters when mode changes
  }

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => {
    if (stepIndex === 0) router.push("/");
    else setStepIndex((i) => i - 1);
  };

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function updatePlayerCount(delta: number) {
    setPlayerNames((prev) => {
      const next = Math.max(3, Math.min(12, prev.length + delta));
      if (next > prev.length)
        return [...prev, ...Array.from({ length: next - prev.length }, (_, i) => `Player ${prev.length + i + 1}`)];
      return prev.slice(0, next);
    });
  }

  function handleGenerate() {
    if (!mode) return;
    setError(null);
    const trimmedNames = playerNames.map((n) => n.trim() || n);
    const entityTypes  = MODE_ENTITY_TYPES[mode];
    try {
      const round = generateGameRound({
        mode,
        difficulty,
        filters: { categories, entityTypes },
        playerNames: trimmedNames,
        extraEntities: getCustomEntities(),
      });
      // Save round AND last-used settings so Play Again works
      saveRound(round);
      saveLastSettings({ mode, difficulty, categories, entityTypes, playerNames: trimmedNames });
      router.push("/play");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  const filterGroups = useMemo(
    () => (mode ? FILTER_GROUPS_BY_MODE[mode] ?? [] : []),
    [mode]
  );

  return (
    <main className="flex-1 flex flex-col hud-bg safe-top safe-bottom">

      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          className="neon-card w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        >
          <ChevronLeft size={18} />
        </motion.button>

        <div className="flex-1 flex gap-1.5 items-center">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < stepIndex ? "bg-pitch opacity-40" : i === stepIndex ? "bg-pitch" : "bg-border"
              }`}
            />
          ))}
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-muted shrink-0">
          {STEP_LABELS[step]}
        </span>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-5 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
          >

            {/* ── Mode ── */}
            {step === "mode" && (
              <section>
                <h1 className="text-3xl font-black uppercase tracking-tight mt-2 mb-1">Select Mode</h1>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-6">What are you guessing today?</p>
                <div className="grid grid-cols-2 gap-3">
                  {GAME_MODES.map((m) => {
                    const selected = mode === m.id;
                    return (
                      <motion.button
                        key={m.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => selectMode(m.id)}
                        className={`neon-card p-4 flex flex-col items-start gap-3 text-left transition-all relative ${
                          selected ? "border-pitch" : "border-border"
                        }`}
                        style={selected ? { boxShadow: "0 0 18px rgba(201,240,0,0.2)" } : {}}
                      >
                        <span className="text-3xl">{m.emoji}</span>
                        <div>
                          <p className={`text-sm font-black uppercase tracking-wide leading-tight ${selected ? "text-pitch" : "text-foreground"}`}>
                            {m.label}
                          </p>
                          <p className="text-[11px] text-muted mt-0.5">{m.description}</p>
                        </div>
                        {selected && <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-pitch" />}
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Filters ── */}
            {step === "filters" && (
              <section>
                <h1 className="text-3xl font-black uppercase tracking-tight mt-2 mb-1">Filters</h1>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-6">Leave empty to include everything</p>
                {filterGroups.length === 0 ? (
                  <div className="neon-card p-6 text-center">
                    <p className="text-muted text-sm">No filters for this mode.</p>
                  </div>
                ) : (
                  filterGroups.map((group) => (
                    <div key={group.label} className="mb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted mb-3">{group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((opt) => (
                          <Chip key={opt} label={opt} selected={categories.includes(opt)} onClick={() => toggleCategory(opt)} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}

            {/* ── Difficulty ── */}
            {step === "difficulty" && (
              <section>
                <h1 className="text-3xl font-black uppercase tracking-tight mt-2 mb-1">Difficulty</h1>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-6">Controls how clear the False9&apos;s hint is</p>
                <div className="space-y-3">
                  {DIFFICULTIES.map((d, i) => {
                    const selected = difficulty === d.id;
                    return (
                      <motion.button
                        key={d.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setDifficulty(d.id)}
                        className={`w-full neon-card p-4 flex items-center gap-4 text-left transition-all ${
                          selected ? "border-pitch" : "border-border"
                        }`}
                        style={selected ? { boxShadow: "0 0 14px rgba(201,240,0,0.15)" } : {}}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          selected ? "bg-pitch text-black" : "bg-surface-2 text-muted"
                        }`}>
                          0{i + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-black uppercase tracking-wide ${selected ? "text-pitch" : "text-foreground"}`}>{d.label}</p>
                          <p className="text-xs text-muted">{d.description}</p>
                        </div>
                        {selected && <div className="w-3 h-3 rounded-full bg-pitch shrink-0" />}
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Players ── */}
            {step === "players" && (
              <section>
                <h1 className="text-3xl font-black uppercase tracking-tight mt-2 mb-1">Players</h1>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-6">3-12 players — pass the phone to each</p>

                <div className="flex items-center justify-center gap-6 mb-6">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => updatePlayerCount(-1)} className="neon-card w-12 h-12 rounded-xl flex items-center justify-center">
                    <Minus size={18} />
                  </motion.button>
                  <div className="text-center">
                    <span className="text-5xl font-black text-pitch neon-text">{playerNames.length}</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1">Players</p>
                  </div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => updatePlayerCount(1)} className="neon-card w-12 h-12 rounded-xl flex items-center justify-center">
                    <Plus size={18} />
                  </motion.button>
                </div>

                <div className="space-y-2">
                  {playerNames.map((name, i) => (
                    <div key={i} className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted uppercase tracking-wider w-5 text-center">
                        {i + 1}
                      </span>
                      <input
                        value={name}
                        onChange={(e) => setPlayerNames((prev) => prev.map((p, idx) => (idx === i ? e.target.value : p)))}
                        placeholder={`Player ${i + 1}`}
                        maxLength={20}
                        className="w-full neon-card rounded-xl pl-9 pr-4 py-3 text-sm font-bold outline-none focus:border-pitch transition-colors bg-transparent"
                      />
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-danger/10 border border-danger/30">
                    <X size={14} className="text-danger shrink-0" />
                    <p className="text-danger text-xs font-bold">{error}</p>
                  </div>
                )}
              </section>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 p-4 safe-bottom glass border-t border-border">
        {step === "players" ? (
          <Button size="lg" className="w-full" onClick={handleGenerate}>Generate Game</Button>
        ) : (
          <Button size="lg" className="w-full" disabled={step === "mode" && !mode} onClick={goNext}>
            Continue
          </Button>
        )}
      </div>
    </main>
  );
}
