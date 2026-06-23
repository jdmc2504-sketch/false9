"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ChevronLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PlayerList, type OnlinePlayer } from "@/components/online/player-list";
import {
  GAME_MODES,
  FILTER_GROUPS_BY_MODE,
  DIFFICULTIES,
} from "@/lib/mode-meta";
import {
  setReady,
  startGame,
  kickPlayer,
  transferHost,
  leaveRoom,
  endRoom,
} from "@/lib/room";
import { supabase } from "@/lib/supabase";
import type { GameMode, Difficulty } from "@/types";

export default function LobbyPage() {
  const router = useRouter();

  const [playerId] = useState(() => sessionStorage.getItem("online_player_id") ?? "");
  const [roomId] = useState(() => sessionStorage.getItem("online_room_id") ?? "");
  const [roomCode] = useState(() => sessionStorage.getItem("online_room_code") ?? "");
  const [isHost] = useState(() => sessionStorage.getItem("online_is_host") === "true");

  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // Settings (host only)
  const [mode, setMode] = useState<GameMode>("player");
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!playerId || !roomId) router.replace("/online");
  }, [playerId, roomId, router]);

  const fetchPlayers = useCallback(async () => {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at");
    if (data) setPlayers(data as OnlinePlayer[]);
  }, [roomId]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    if (!roomId) return;

    const playerSub = supabase
      .channel(`lobby-players-${roomId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "players",
        filter: `room_id=eq.${roomId}`,
      }, () => fetchPlayers())
      .subscribe();

    const roomSub = supabase
      .channel(`lobby-room-${roomId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        const room = payload.new as { phase: string; status: string };
        if (room.phase === "reveal" && room.status === "active") {
          router.push("/online/game");
        }
        if (room.status === "ended") {
          router.replace("/");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(playerSub);
      supabase.removeChannel(roomSub);
    };
  }, [roomId, router, fetchPlayers]);

  async function handleReady() {
    const next = !isReady;
    setIsReady(next);
    await setReady(playerId, next);
  }

  async function handleStart() {
    setStarting(true);
    setError(null);
    try {
      await startGame({
        roomId,
        mode,
        difficulty,
        filters: { categories, entityTypes: [] },
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start");
      setStarting(false);
    }
  }

  async function handleKick(targetId: string) {
    await kickPlayer(targetId, roomId);
    await endRoom(roomId);
  }

  async function handleTransferHost(targetId: string) {
    await transferHost(targetId, roomId);
    sessionStorage.setItem("online_is_host", "false");
  }

  async function handleLeave() {
    await leaveRoom(playerId, roomId);
    if (isHost) await endRoom(roomId);
    router.replace("/");
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const connectedPlayers = players.filter((p) => p.connected);
  const allReady = connectedPlayers.length >= 3 && connectedPlayers.every((p) => p.is_ready);
  const filterGroups = FILTER_GROUPS_BY_MODE[mode] ?? [];

  return (
    <main className="flex-1 flex flex-col hud-bg safe-top safe-bottom">
      <div className="flex items-center justify-between p-5">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleLeave}
          className="neon-card w-10 h-10 rounded-xl flex items-center justify-center"
        >
          <ChevronLeft size={18} />
        </motion.button>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-muted">Lobby</p>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar flex flex-col gap-5">

        {/* Room code */}
        <div className="neon-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted mb-1">Room Code</p>
            <p className="text-4xl font-black tracking-[0.3em] text-pitch neon-text">{roomCode}</p>
            <p className="text-xs text-muted mt-1">Share this with your friends</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={copyCode}
            className="neon-card w-12 h-12 rounded-xl flex items-center justify-center"
          >
            {copied ? <Check size={18} className="text-pitch" /> : <Copy size={18} className="text-muted" />}
          </motion.button>
        </div>

        {/* Players */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted mb-3">
            Players ({connectedPlayers.length})
          </p>
          <PlayerList
            players={players}
            currentPlayerId={playerId}
            isHost={isHost}
            onKick={handleKick}
            onTransferHost={handleTransferHost}
          />
        </div>

        {/* Settings — host only */}
        {isHost && (
          <div className="neon-card p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-muted">Game Settings</p>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettings((s) => !s)}
                className="text-xs font-black text-pitch uppercase tracking-wide"
              >
                {showSettings ? "Hide" : "Edit"}
              </motion.button>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  {/* Mode */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Mode</p>
                    <div className="flex flex-wrap gap-2">
                      {GAME_MODES.map((m) => (
                        <Chip
                          key={m.id}
                          label={`${m.emoji} ${m.label}`}
                          selected={mode === m.id}
                          onClick={() => { setMode(m.id); setCategories([]); }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Filters */}
                  {filterGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((opt) => (
                          <Chip
                            key={opt}
                            label={opt}
                            selected={categories.includes(opt)}
                            onClick={() =>
                              setCategories((prev) =>
                                prev.includes(opt) ? prev.filter((c) => c !== opt) : [...prev, opt]
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Difficulty */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Difficulty</p>
                    <div className="flex flex-wrap gap-2">
                      {DIFFICULTIES.map((d) => (
                        <Chip
                          key={d.id}
                          label={d.label}
                          selected={difficulty === d.id}
                          onClick={() => setDifficulty(d.id)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showSettings && (
              <p className="text-sm font-bold">
                {GAME_MODES.find((m) => m.id === mode)?.emoji}{" "}
                {GAME_MODES.find((m) => m.id === mode)?.label} ·{" "}
                <span className="text-muted capitalize">{difficulty}</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-danger text-sm font-bold text-center">{error}</p>
        )}

        {!isHost && (
          <Button
            size="lg"
            className="w-full"
            onClick={handleReady}
            variant={isReady ? "secondary" : "default"}
          >
            {isReady ? "✓ Ready" : "Ready Up"}
          </Button>
        )}

        {isHost && (
          <Button
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={!allReady || starting}
          >
            <Play size={16} className="mr-2" />
            {starting ? "Starting..." : allReady ? "Start Game" : `Waiting (${connectedPlayers.filter(p => p.is_ready).length}/${connectedPlayers.length} ready)`}
          </Button>
        )}
      </div>
    </main>
  );
}
