"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, RotateCcw, Check, X, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PassScreen } from "@/components/game/pass-screen";
import { RevealCard } from "@/components/game/reveal-card";
import { loadRound, saveRound, clearRound, loadLastSettings, saveLastSettings } from "@/lib/game-session";
import { generateGameRound, tallyVotes } from "@/game-logic/engine";
import { getCustomEntities } from "@/lib/custom-entities";
import type { GameRound } from "@/types";

type LocalPhase = "reveal-pass" | "reveal-show" | "discussion" | "voting-pass" | "voting-show" | "results";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// Timer hook with a resetKey so Play Again can restart it
function useCountdown(seconds: number, running: boolean, resetKey: number) {
  const [remaining, setRemaining] = useState(seconds);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset remaining when resetKey changes
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional timer reset on Play Again
  useEffect(() => { setRemaining(seconds); }, [resetKey, seconds]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, resetKey]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return { display: `${mm}:${ss}`, remaining };
}

// ── Exit confirmation sheet ───────────────────────────────────
function ExitConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-4 safe-bottom"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="neon-card w-full max-w-sm p-5"
      >
        <p className="text-xs font-black uppercase tracking-[0.25em] text-muted mb-1">Quit Game</p>
        <h2 className="text-xl font-black uppercase tracking-tight mb-1">Are you sure?</h2>
        <p className="text-sm text-muted mb-6">The current round will be lost.</p>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>Keep Playing</Button>
          <Button variant="danger" size="md" className="flex-1" onClick={onConfirm}>Quit</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── HUD top bar ───────────────────────────────────────────────
function GameTopBar({ label, sub, onExit }: { label: string; sub?: string; onExit: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2">
      <div className="flex items-center gap-2">
        <div className="hud-badge">{label}</div>
        {sub && <div className="hud-badge">{sub}</div>}
      </div>
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onExit}
        className="neon-card w-9 h-9 rounded-xl flex items-center justify-center"
        aria-label="Exit game"
      >
        <X size={15} className="text-muted" />
      </motion.button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function PlayPage() {
  const router = useRouter();
  const [round, setRound]               = useState<GameRound | null>(null);
  const [localPhase, setLocalPhase]     = useState<LocalPhase>("reveal-pass");
  const [cursor, setCursor]             = useState(0);
  const [pendingVotes, setPendingVotes] = useState<Record<number, number>>({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const { display: timerDisplay, remaining: timerRemaining } =
    useCountdown(120, timerRunning, timerResetKey);

  useEffect(() => {
    const r = loadRound();
    if (!r) { router.replace("/create"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage
    setRound(r);
  }, [router]);

  function handleExit() { clearRound(); router.push("/"); }

  /** Regenerate with the exact same mode, difficulty, filters and player names */
  function handlePlayAgain() {
    const settings = loadLastSettings();
    if (!settings) { router.push("/create"); return; }
    try {
      const newRound = generateGameRound({
        mode: settings.mode,
        difficulty: settings.difficulty,
        filters: { categories: settings.categories, entityTypes: settings.entityTypes },
        playerNames: settings.playerNames,
        extraEntities: getCustomEntities(),
      });
      saveRound(newRound);
      // Keep last settings unchanged — names/mode/difficulty all stay the same
      saveLastSettings(settings);
      // Reset all local state in place (no navigation needed)
      setRound(newRound);
      setLocalPhase("reveal-pass");
      setCursor(0);
      setPendingVotes({});
      setTimerRunning(false);
      setTimerResetKey((k) => k + 1);
    } catch {
      router.push("/create");
    }
  }

  if (!round) {
    return (
      <main className="flex-1 flex items-center justify-center hud-bg">
        <p className="text-muted text-sm font-bold uppercase tracking-widest">Loading…</p>
      </main>
    );
  }

  const players = round.playerNames;

  // ── Reveal pass ───────────────────────────────────────────────
  if (localPhase === "reveal-pass") {
    return (
      <main className="flex-1 flex flex-col safe-top safe-bottom">
        <GameTopBar label={`Reveal ${cursor + 1}/${players.length}`} sub={round.mode.toUpperCase()} onExit={() => setShowExitConfirm(true)} />
        <PassScreen nextPlayerName={players[cursor]} subtitle={`Player ${cursor + 1} of ${players.length}`} onReveal={() => setLocalPhase("reveal-show")} />
        <AnimatePresence>{showExitConfirm && <ExitConfirm onConfirm={handleExit} onCancel={() => setShowExitConfirm(false)} />}</AnimatePresence>
      </main>
    );
  }

  // ── Reveal show ───────────────────────────────────────────────
  if (localPhase === "reveal-show") {
    const role = round.roles[cursor];
    return (
      <main className="flex-1 flex flex-col safe-top safe-bottom">
        <GameTopBar label={`Reveal ${cursor + 1}/${players.length}`} onExit={() => setShowExitConfirm(true)} />
        <RevealCard
          playerName={role.playerName}
          isFalse9={role.isFalse9}
          text={role.revealText}
          onHideAndContinue={() => {
            if (cursor + 1 < players.length) { setCursor(cursor + 1); setLocalPhase("reveal-pass"); }
            else { setCursor(0); setLocalPhase("discussion"); }
          }}
        />
        <AnimatePresence>{showExitConfirm && <ExitConfirm onConfirm={handleExit} onCancel={() => setShowExitConfirm(false)} />}</AnimatePresence>
      </main>
    );
  }

  // ── Discussion ────────────────────────────────────────────────
  if (localPhase === "discussion") {
    return (
      <main className="flex-1 flex flex-col safe-top safe-bottom hud-bg">
        <GameTopBar label={round.mode.toUpperCase()} sub={`${players.length} Players`} onExit={() => setShowExitConfirm(true)} />
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted mb-2">Discussion Time</p>
            <h1 className="text-3xl font-black uppercase tracking-tight leading-none">Who is the</h1>
            <h1 className="text-5xl font-black uppercase tracking-tight leading-tight text-pitch neon-text">False 9?</h1>
          </motion.div>

          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8">
            <div
              className={`neon-card px-10 py-5 text-center inline-block ${timerRemaining < 20 && timerRunning ? "border-danger" : ""}`}
              style={timerRunning && timerRemaining < 20 ? { boxShadow: "0 0 20px rgba(255,61,90,0.3)" } : {}}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-1">Time Remaining</p>
              <p
                className={`text-5xl font-black tabular-nums tracking-tight ${timerRemaining < 20 && timerRunning ? "text-danger" : "text-pitch"}`}
                style={timerRunning ? { textShadow: timerRemaining < 20 ? "0 0 20px rgba(255,61,90,0.6)" : "0 0 20px rgba(201,240,0,0.5)" } : {}}
              >
                {timerDisplay}
              </p>
            </div>
          </motion.div>

          <p className="text-xs text-muted font-bold max-w-xs mb-8 leading-relaxed">
            Discuss freely — but don&apos;t say the answer outright. When ready, vote.
          </p>

          <div className="w-full max-w-xs space-y-3">
            {!timerRunning && timerRemaining === 120 && (
              <Button variant="secondary" size="md" className="w-full" onClick={() => setTimerRunning(true)}>Start Timer</Button>
            )}
            <Button size="lg" className="w-full" onClick={() => setLocalPhase("voting-pass")}>Start Voting</Button>
          </div>
        </div>
        <AnimatePresence>{showExitConfirm && <ExitConfirm onConfirm={handleExit} onCancel={() => setShowExitConfirm(false)} />}</AnimatePresence>
      </main>
    );
  }

  // ── Voting pass ───────────────────────────────────────────────
  if (localPhase === "voting-pass") {
    return (
      <main className="flex-1 flex flex-col safe-top safe-bottom">
        <GameTopBar label={`Vote ${cursor + 1}/${players.length}`} onExit={() => setShowExitConfirm(true)} />
        <PassScreen nextPlayerName={players[cursor]} subtitle={`Vote ${cursor + 1} of ${players.length}`} onReveal={() => setLocalPhase("voting-show")} />
        <AnimatePresence>{showExitConfirm && <ExitConfirm onConfirm={handleExit} onCancel={() => setShowExitConfirm(false)} />}</AnimatePresence>
      </main>
    );
  }

  // ── Voting show ───────────────────────────────────────────────
  if (localPhase === "voting-show") {
    const currentVote = pendingVotes[cursor];
    return (
      <main className="flex-1 flex flex-col safe-top safe-bottom hud-bg">
        <GameTopBar label={`Vote ${cursor + 1}/${players.length}`} sub={players[cursor]} onExit={() => setShowExitConfirm(true)} />
        <div className="flex-1 flex flex-col px-5 pt-4 pb-6 overflow-y-auto">
          <div className="text-center mb-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-muted mb-1">{players[cursor]}, cast your vote</p>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Who is the <span className="text-pitch neon-text">False 9?</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {players.map((name, i) => {
              const isSelected = currentVote === i;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPendingVotes((prev) => ({ ...prev, [cursor]: i }))}
                  className={`neon-card p-4 flex items-center gap-3 text-left transition-all ${isSelected ? "border-pitch" : "border-border"}`}
                  style={isSelected ? { boxShadow: "0 0 16px rgba(201,240,0,0.25)" } : {}}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 avatar-ring ${isSelected ? "selected bg-pitch text-black" : "bg-surface-2 text-muted"}`}>
                    {initials(name)}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-black uppercase tracking-wide truncate ${isSelected ? "text-pitch" : "text-foreground"}`}>{name}</p>
                    {isSelected && <p className="text-[10px] font-bold uppercase tracking-widest text-pitch opacity-70">Your vote</p>}
                  </div>
                  {isSelected && <Check size={16} className="text-pitch ml-auto shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="px-5 pb-6 safe-bottom">
          <Button
            size="lg"
            className="w-full"
            disabled={currentVote === undefined}
            onClick={() => {
              if (cursor + 1 < players.length) { setCursor(cursor + 1); setLocalPhase("voting-pass"); }
              else {
                const finalRound = { ...round, votes: pendingVotes, phase: "results" as const };
                setRound(finalRound);
                saveRound(finalRound);
                setLocalPhase("results");
              }
            }}
          >
            {cursor + 1 < players.length ? "Confirm & Pass" : "Reveal Results"}
          </Button>
        </div>
        <AnimatePresence>{showExitConfirm && <ExitConfirm onConfirm={handleExit} onCancel={() => setShowExitConfirm(false)} />}</AnimatePresence>
      </main>
    );
  }

  // ── Results ───────────────────────────────────────────────────
  const roundWithVotes = { ...round, votes: pendingVotes };
  const { winners, counts } = tallyVotes(roundWithVotes);
  const caught       = winners.length === 1 && round.false9Indices.includes(winners[0]);
  const false9Names  = round.false9Indices.map((i) => players[i]);

  return (
    <main className="flex-1 flex flex-col safe-top safe-bottom hud-bg">
      <GameTopBar label="Results" sub={caught ? "Caught!" : "Escaped!"} onExit={() => setShowExitConfirm(true)} />

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* Verdict */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`neon-card p-6 text-center ${caught ? "border-pitch" : "border-danger"}`}
          style={{ boxShadow: caught ? "0 0 30px rgba(201,240,0,0.2)" : "0 0 30px rgba(255,61,90,0.2)" }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-1">
            {caught ? "The group wins" : "The false 9 escapes"}
          </p>
          <h1 className={`text-5xl font-black uppercase tracking-tight ${caught ? "text-pitch neon-text" : "text-danger"}`}>
            {caught ? "Caught!" : "Escaped!"}
          </h1>
        </motion.div>

        {/* Answer */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="neon-card p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-1">The Answer</p>
          <p className="text-2xl font-black uppercase tracking-tight text-pitch neon-text">{round.entity.name}</p>
          <p className="text-xs text-muted mt-1 capitalize">{round.entity.type}</p>
        </motion.div>

        {/* False 9s */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="neon-card p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-3">
            The False 9{false9Names.length > 1 ? "s" : ""}
          </p>
          <div className="flex gap-2 flex-wrap">
            {false9Names.map((name) => (
              <div key={name} className="flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-xl px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center">
                  <span className="text-xs font-black text-danger">{initials(name)}</span>
                </div>
                <span className="text-sm font-black uppercase tracking-wide text-danger">{name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vote breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="neon-card p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-3">Vote Breakdown</p>
          <div className="space-y-2">
            {players.map((name, i) => {
              const voteCount = counts[i] || 0;
              const isFalse9  = round.false9Indices.includes(i);
              const pct       = players.length > 0 ? (voteCount / players.length) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isFalse9 ? "bg-danger/20 text-danger" : "bg-surface-2 text-muted"}`}>
                    {initials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-black uppercase tracking-wide ${isFalse9 ? "text-danger" : "text-foreground"}`}>
                        {name} {isFalse9 ? "⚠" : ""}
                      </span>
                      <span className="text-xs font-black text-muted">{voteCount}</span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                        className={`h-full rounded-full ${isFalse9 ? "bg-danger" : "bg-pitch"}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Three-button action bar ── */}
      <div className="px-5 pt-3 pb-6 safe-bottom space-y-3">
        {/* Play Again — big yellow, most prominent */}
        <Button size="lg" className="w-full" onClick={handlePlayAgain}>
          <RotateCcw size={16} /> Play Again
        </Button>
        {/* Home + New Game — secondary row */}
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={() => { clearRound(); router.push("/"); }}>
            <Home size={15} /> Home
          </Button>
          <Button variant="secondary" size="md" className="flex-1" onClick={() => { clearRound(); router.push("/create"); }}>
            <PlusCircle size={15} /> New Game
          </Button>
        </div>
      </div>

      <AnimatePresence>{showExitConfirm && <ExitConfirm onConfirm={handleExit} onCancel={() => setShowExitConfirm(false)} />}</AnimatePresence>
    </main>
  );
}
