"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  submitVote,
  startVoting,
  showResults,
  playAgain,
  endRoom,
  leaveRoom,
} from "@/lib/room";
import type { GameEntity } from "@/types";

interface RoomRow {
  phase: string;
  status: string;
  entity: GameEntity | null;
  mode: string;
  difficulty: string;
}

interface PlayerRow {
  id: string;
  name: string;
  avatar: string;
  is_host: boolean;
  role: string | null;
  reveal_text: string | null;
  has_voted: boolean;
  voted_for: string | null;
  connected: boolean;
}

// Countdown hook
function useCountdown(seconds: number, running: boolean, onEnd?: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds, running]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(ref.current!);
          endRef.current?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return { display: `${mm}:${ss}`, remaining };
}

export default function OnlineGamePage() {
  const router = useRouter();

  const playerId = sessionStorage.getItem("online_player_id") ?? "";
  const roomId = sessionStorage.getItem("online_room_id") ?? "";
  const isHost = sessionStorage.getItem("online_is_host") === "true";

  const [room, setRoom] = useState<RoomRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [me, setMe] = useState<PlayerRow | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [revealHidden, setRevealHidden] = useState(false);
  const [showChangeSettings, setShowChangeSettings] = useState(false);

  // Redirect if no session
  useEffect(() => {
    if (!playerId || !roomId) router.replace("/online");
  }, [playerId, roomId, router]);

  const fetchAll = useCallback(async () => {
    const [{ data: roomData }, { data: playersData }] = await Promise.all([
      supabase.from("rooms").select("*").eq("id", roomId).single(),
      supabase.from("players").select("*").eq("room_id", roomId).order("created_at"),
    ]);
    if (roomData) setRoom(roomData as RoomRow);
    if (playersData) {
      setPlayers(playersData as PlayerRow[]);
      const myRow = (playersData as PlayerRow[]).find((p) => p.id === playerId);
      if (myRow) {
        setMe(myRow);
        setHasVoted(myRow.has_voted);
      }
    }
  }, [roomId, playerId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime
  useEffect(() => {
    if (!roomId) return;

    const roomSub = supabase
      .channel(`game-room-${roomId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}`,
      }, (payload) => {
        const r = payload.new as RoomRow;
        setRoom(r);
        if (r.status === "ended") router.replace("/");
      })
      .subscribe();

    const playerSub = supabase
      .channel(`game-players-${roomId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}`,
      }, () => fetchAll())
      .subscribe();

    return () => {
      supabase.removeChannel(roomSub);
      supabase.removeChannel(playerSub);
    };
  }, [roomId, router, fetchAll]);

  // Auto-show results when all voted
  useEffect(() => {
    if (!room || room.phase !== "voting" || !isHost) return;
    const connected = players.filter((p) => p.connected);
    if (connected.length > 0 && connected.every((p) => p.has_voted)) {
      showResults(roomId);
    }
  }, [players, room, isHost, roomId]);

  async function handleVote(targetId: string) {
    if (hasVoted) return;
    setSelectedVote(targetId);
    setHasVoted(true);
    await submitVote(playerId, targetId, roomId);
  }

  async function handleStartVoting() {
    await startVoting(roomId);
  }

  async function handlePlayAgain() {
    await playAgain(roomId);
  }

  async function handleLeave() {
    await leaveRoom(playerId, roomId);
    if (isHost) await endRoom(roomId);
    router.replace("/");
  }

  // Voting timer auto-lock
  const votingRunning = room?.phase === "voting";
  useCountdown(120, votingRunning, async () => {
    if (isHost) await showResults(roomId);
  });
  const { display: timerDisplay, remaining: timerRemaining } = useCountdown(120, votingRunning);

  if (!room || !me) {
    return (
      <main className="flex-1 flex items-center justify-center hud-bg">
        <p className="text-muted text-sm font-bold uppercase tracking-widest">Loading…</p>
      </main>
    );
  }

  const connectedPlayers = players.filter((p) => p.connected);

  // ── Reveal phase ──────────────────────────────────────────────
  if (room.phase === "reveal") {
    return (
      <main className="flex-1 flex flex-col hud-bg safe-top safe-bottom">
        <div className="flex items-center justify-between p-5">
          <motion.button whileTap={{ scale: 0.88 }} onClick={handleLeave}
            className="neon-card w-10 h-10 rounded-xl flex items-center justify-center">
            <Home size={16} className="text-muted" />
          </motion.button>
          <p className="text-xs font-black uppercase tracking-widest text-muted">Your Role</p>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <AnimatePresence mode="wait">
            {!revealHidden ? (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-sm"
              >
                <div className="neon-card p-6 flex flex-col items-center gap-4 text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-muted">
                    {me.avatar} {me.name}
                  </p>

                  {me.role === "false9" ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-danger/20 flex items-center justify-center">
                        <span className="text-3xl">🕵️</span>
                      </div>
                      <div>
                        <p className="text-danger font-black text-lg uppercase tracking-wide mb-1">
                          You are the False 9
                        </p>
                        <p className="text-xs text-muted mb-3">Your hint:</p>
                        <p className="text-xl font-black text-pitch neon-text">
                          {me.reveal_text}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-pitch/10 flex items-center justify-center">
                        <span className="text-3xl">⚽</span>
                      </div>
                      <div>
                        <p className="text-muted text-xs uppercase tracking-widest mb-2">
                          The answer is
                        </p>
                        <p className="text-3xl font-black text-pitch neon-text">
                          {me.reveal_text}
                        </p>
                        <p className="text-xs text-muted mt-2">Find the False 9 who doesn't know this</p>
                      </div>
                    </>
                  )}

                  <Button
                    size="lg"
                    className="w-full mt-2"
                    onClick={() => setRevealHidden(true)}
                  >
                    Hide & I'm Done
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-sm flex flex-col items-center gap-4"
              >
                <div className="neon-card p-6 text-center w-full">
                  <p className="text-pitch font-black text-lg uppercase mb-1">Role Hidden ✓</p>
                  <p className="text-sm text-muted">Waiting for everyone to check their role…</p>
                </div>

                {isHost && (
                  <Button size="lg" className="w-full" onClick={handleStartVoting}>
                    Start Voting
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    );
  }

  // ── Voting phase ──────────────────────────────────────────────
  if (room.phase === "voting") {
    const urgentTimer = timerRemaining <= 30;

    return (
      <main className="flex-1 flex flex-col hud-bg safe-top safe-bottom">
        <div className="flex items-center justify-between p-5">
          <motion.button whileTap={{ scale: 0.88 }} onClick={handleLeave}
            className="neon-card w-10 h-10 rounded-xl flex items-center justify-center">
            <Home size={16} className="text-muted" />
          </motion.button>
          <div className={`text-2xl font-black tabular-nums ${urgentTimer ? "text-danger" : "text-pitch neon-text"}`}>
            {timerDisplay}
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar flex flex-col gap-4">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-muted mb-1">Vote</p>
            <p className="text-sm text-muted">
              {hasVoted ? "Vote locked in — waiting for others" : "Who is the False 9?"}
            </p>
          </div>

          {connectedPlayers.map((player) => {
            const isMe = player.id === playerId;
            const isVoted = selectedVote === player.id;

            return (
              <motion.button
                key={player.id}
                whileTap={!isMe && !hasVoted ? { scale: 0.97 } : {}}
                onClick={() => !isMe && !hasVoted && handleVote(player.id)}
                disabled={isMe || hasVoted}
                className={`
                  neon-card px-4 py-4 flex items-center gap-3 w-full text-left transition-all
                  ${isVoted ? "border-pitch bg-pitch/10" : ""}
                  ${isMe ? "opacity-50" : ""}
                `}
              >
                <span className="text-2xl">{player.avatar}</span>
                <div className="flex-1">
                  <p className="font-black text-sm uppercase tracking-wide">
                    {player.name} {isMe && "(you)"}
                  </p>
                  <p className="text-xs text-muted">
                    {player.has_voted ? "✓ Voted" : "Thinking…"}
                  </p>
                </div>
                {isVoted && <span className="text-pitch font-black text-xs uppercase">Your vote</span>}
              </motion.button>
            );
          })}
        </div>
      </main>
    );
  }

  // ── Results phase ──────────────────────────────────────────────
  if (room.phase === "results") {
    // Tally votes
    const voteCounts: Record<string, number> = {};
    connectedPlayers.forEach((p) => {
      if (p.voted_for) {
        voteCounts[p.voted_for] = (voteCounts[p.voted_for] || 0) + 1;
      }
    });

    const maxVotes = Math.max(0, ...Object.values(voteCounts));
    const mostVoted = connectedPlayers.filter((p) => (voteCounts[p.id] || 0) === maxVotes && maxVotes > 0);
    const false9Players = connectedPlayers.filter((p) => p.role === "false9");
    const groupWon = mostVoted.length === 1 && false9Players.some((f) => f.id === mostVoted[0]?.id);

    return (
      <main className="flex-1 flex flex-col hud-bg safe-top safe-bottom">
        <div className="flex items-center justify-between p-5">
          <motion.button whileTap={{ scale: 0.88 }} onClick={handleLeave}
            className="neon-card w-10 h-10 rounded-xl flex items-center justify-center">
            <Home size={16} className="text-muted" />
          </motion.button>
          <p className="text-xs font-black uppercase tracking-widest text-muted">Results</p>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar flex flex-col gap-4">
          {/* Outcome banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`neon-card p-5 text-center ${groupWon ? "bg-pitch/10 border-pitch" : "bg-danger/10 border-danger"}`}
          >
            <p className="text-4xl mb-2">{groupWon ? "🎉" : "🕵️"}</p>
            <p className={`text-xl font-black uppercase tracking-tight ${groupWon ? "text-pitch neon-text" : "text-danger"}`}>
              {groupWon ? "Caught!" : "False 9 Escapes!"}
            </p>
            <p className="text-sm text-muted mt-1">
              {room.entity?.name && `The answer was ${room.entity.name}`}
            </p>
          </motion.div>

          {/* The False 9 revealed */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">The False 9</p>
            {false9Players.map((p) => (
              <div key={p.id} className="neon-card px-4 py-3 flex items-center gap-3 border-danger/40">
                <span className="text-2xl">{p.avatar}</span>
                <p className="font-black text-sm uppercase">{p.name}</p>
                <span className="ml-auto text-danger text-xs font-black uppercase">False 9</span>
              </div>
            ))}
          </div>

          {/* Vote breakdown */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">Who Voted For Who</p>
            <div className="flex flex-col gap-2">
              {connectedPlayers.map((voter) => {
                const votedFor = connectedPlayers.find((p) => p.id === voter.voted_for);
                return (
                  <div key={voter.id} className="neon-card px-4 py-3 flex items-center gap-2">
                    <span className="text-lg">{voter.avatar}</span>
                    <span className="text-xs font-bold flex-1 truncate">{voter.name}</span>
                    <span className="text-xs text-muted">voted</span>
                    <span className="text-lg">{votedFor?.avatar ?? "–"}</span>
                    <span className="text-xs font-bold truncate">{votedFor?.name ?? "nobody"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vote tally */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">Vote Tally</p>
            <div className="flex flex-col gap-2">
              {connectedPlayers
                .sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0))
                .map((p) => (
                  <div key={p.id} className={`neon-card px-4 py-3 flex items-center gap-3 ${mostVoted.find(m => m.id === p.id) ? "border-pitch" : ""}`}>
                    <span className="text-xl">{p.avatar}</span>
                    <span className="text-sm font-black flex-1 uppercase">{p.name}</span>
                    <span className={`text-lg font-black ${mostVoted.find(m => m.id === p.id) ? "text-pitch" : "text-muted"}`}>
                      {voteCounts[p.id] || 0} vote{(voteCounts[p.id] || 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Actions — host only */}
          {isHost && (
            <div className="flex flex-col gap-3 mt-2">
              <Button size="lg" className="w-full" onClick={handlePlayAgain}>
                <RotateCcw size={16} className="mr-2" />
                Play Again
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={() => setShowChangeSettings(true)}
              >
                <Settings size={16} className="mr-2" />
                Change Settings
              </Button>
              <Button size="lg" variant="secondary" className="w-full" onClick={handleLeave}>
                <Home size={16} className="mr-2" />
                Home
              </Button>
            </div>
          )}

          {!isHost && (
            <p className="text-center text-xs text-muted font-bold uppercase tracking-wider">
              Waiting for host to start next round…
            </p>
          )}
        </div>

        {/* Change settings sheet — redirects to lobby flow */}
        <AnimatePresence>
          {showChangeSettings && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowChangeSettings(false)}
              />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="fixed bottom-0 inset-x-0 z-50 p-4 safe-bottom"
              >
                <div className="neon-card p-4 max-w-sm mx-auto flex flex-col gap-3">
                  <p className="text-xs font-black uppercase tracking-widest text-muted text-center">
                    Change Settings
                  </p>
                  <p className="text-sm text-muted text-center">
                    Go back to the lobby to change mode, filters and difficulty. Players stay in the room.
                  </p>
                  <Button size="lg" className="w-full" onClick={async () => {
                    await supabase.from("rooms").update({ phase: "lobby", status: "lobby" }).eq("id", roomId);
                    router.push("/online/lobby");
                  }}>
                    Go to Lobby
                  </Button>
                  <Button size="lg" variant="secondary" className="w-full" onClick={() => setShowChangeSettings(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    );
  }

  return null;
}
