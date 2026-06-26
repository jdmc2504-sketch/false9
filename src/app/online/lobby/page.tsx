"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ChevronLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PlayerList, type OnlinePlayer } from "@/components/online/player-list";
import { GAME_MODES, FILTER_GROUPS_BY_MODE, DIFFICULTIES } from "@/lib/mode-meta";
import { setReady, startGame, kickPlayer, transferHost, leaveRoom, endRoom } from "@/lib/room";
import { supabase } from "@/lib/supabase";
import type { GameMode, Difficulty } from "@/types";

export default function LobbyPage() {
  const router = useRouter();

  const [playerId, setPlayerId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [mode, setMode] = useState<GameMode>("player");
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const pid = sessionStorage.getItem("online_player_id") ?? "";
    const rid = sessionStorage.getItem("online_room_id") ?? "";
    const host = sessionStorage.getItem("online_is_host") === "true";

    if (!pid || !rid) { router.replace("/online"); return; }

    setPlayerId(pid);
    setRoomId(rid);
    setIsHost(host);

    if (host) {
      setIsReady(true);
      setReady(pid, true).catch(console.error);
    }

    // Fetch initial state
    async function init() {
      const [{ data: pd }, { data: rd }] = await Promise.all([
        supabase.from("players").select("*").eq("room_id", rid).order("created_at"),
        supabase.from("rooms").select("code,phase,status").eq("id", rid).single(),
      ]);
      if (pd) setPlayers(pd as OnlinePlayer[]);
      if (rd) {
        setRoomCode(rd.code);
        if (rd.phase === "reveal" && rd.status === "active") router.push("/online/game");
        if (rd.status === "ended") router.replace("/");
      }
    }
    init();

    // Supabase broadcast channel — WebSocket based
    const channel = supabase.channel(`room:${rid}`, {
      config: { broadcast: { self: true } },
    });

    // Listen for any player changes
    channel
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "players",
        filter: `room_id=eq.${rid}`,
      }, async () => {
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("room_id", rid)
          .order("created_at");
        if (data) setPlayers(data as OnlinePlayer[]);
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${rid}`,
      }, async (payload) => {
        const r = payload.new as { code: string; phase: string; status: string };
        setRoomCode(r.code);
        if (r.phase === "reveal" && r.status === "active") router.push("/online/game");
        if (r.status === "ended") router.replace("/");
      })
      .subscribe((status) => {
        console.log("Supabase channel status:", status);
      });

    // Fallback poll every 3 seconds in case WebSocket misses anything
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", rid)
        .order("created_at");
      if (data) setPlayers(data as OnlinePlayer[]);
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReady() {
    const next = !isReady;
    setIsReady(next);
    await setReady(playerId, next);
  }

  async function handleStart() {
    setStarting(true);
    setError(null);
    try {
      await startGame({ roomId, mode, difficulty, filters: { categories, entityTypes: [] } });
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
    setIsHost(false);
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
  const readyCount = connectedPlayers.filter((p) => p.is_ready).length;
  const filterGroups = FILTER_GROUPS_BY_MODE[mode] ?? [];

  return (
    <main className="flex-1 flex flex-col hud-bg safe-top safe-bottom">
      <div className="flex items-center justify-between p-5">
        <motion.button whileTap={{ scale: 0.88 }} onClick={handleLeave}
          className="neon-card w-10 h-10 rounded-xl flex items-center justify-center">
          <ChevronLeft size={18} />
        </motion.button>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-muted">Lobby</p>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar flex flex-col gap-5">

        <div className="neon-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted mb-1">Room Code</p>
            <p className="text-4xl font-black tracking-[0.3em] text-pitch neon-text">{roomCode || "..."}</p>
            <p className="text-xs text-muted mt-1">Share this with your friends</p>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={copyCode}
            className="neon-card w-12 h-12 rounded-xl flex items-center justify-center">
            {copied ? <Check size={18} className="text-pitch" /> : <Copy size={18} className="text-muted" />}
          </motion.button>
        </div>

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

        {isHost && (
          <div className="neon-card p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-muted">Game Settings</p>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSettings((s) => !s)}
                className="text-xs font-black text-pitch uppercase tracking-wide">
                {showSettings ? "Hide" : "Edit"}
              </motion.button>
            </div>
            <AnimatePresence>
              {showSettings && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4 overflow-hidden">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Mode</p>
                    <div className="flex flex-wrap gap-2">
                      {GAME_MODES.map((m) => (
                        <Chip key={m.id} label={`${m.emoji} ${m.label}`} selected={mode === m.id}
                          onClick={() => { setMode(m.id); setCategories([]); }} />
                      ))}
                    </div>
                  </div>
                  {filterGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">{group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((opt) => (
                          <Chip key={opt} label={opt} selected={categories.includes(opt)}
                            onClick={() => setCategories((prev) =>
                              prev.includes(opt) ? prev.filter((c) => c !== opt) : [...prev, opt])} />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Difficulty</p>
                    <div className="flex flex-wrap gap-2">
                      {DIFFICULTIES.map((d) => (
                        <Chip key={d.id} label={d.label} selected={difficulty === d.id}
                          onClick={() => setDifficulty(d.id)} />
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

        {error && <p className="text-danger text-sm font-bold text-center">{error}</p>}

        {!isHost && (
          <Button size="lg" className="w-full" onClick={handleReady}
            variant={isReady ? "secondary" : "primary"}>
            {isReady ? "✓ Ready" : "Ready Up"}
          </Button>
        )}

        {isHost && (
          <Button size="lg" className="w-full" onClick={handleStart} disabled={!allReady || starting}>
            <Play size={16} className="mr-2" />
            {starting ? "Starting..." : allReady ? "Start Game" : `Waiting (${readyCount}/${connectedPlayers.length} ready)`}
          </Button>
        )}
      </div>
    </main>
  );
}
