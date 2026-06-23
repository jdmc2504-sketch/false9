"use client";

import { motion } from "framer-motion";
import { Crown, X, ArrowRightLeft } from "lucide-react";

export interface OnlinePlayer {
  id: string;
  name: string;
  avatar: string;
  is_host: boolean;
  is_ready: boolean;
  connected: boolean;
}

interface PlayerListProps {
  players: OnlinePlayer[];
  currentPlayerId: string;
  isHost: boolean;
  onKick?: (playerId: string) => void;
  onTransferHost?: (playerId: string) => void;
}

export function PlayerList({
  players,
  currentPlayerId,
  isHost,
  onKick,
  onTransferHost,
}: PlayerListProps) {
  const connected = players.filter((p) => p.connected);

  return (
    <div className="flex flex-col gap-2">
      {connected.map((player) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="neon-card px-4 py-3 flex items-center gap-3"
        >
          {/* Avatar */}
          <div className="text-2xl w-10 h-10 flex items-center justify-center bg-surface-2 rounded-xl">
            {player.avatar}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm uppercase tracking-wide truncate">
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="text-pitch"> (you)</span>
                )}
              </span>
              {player.is_host && (
                <Crown size={13} className="text-pitch shrink-0" />
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              {player.is_ready ? (
                <span className="text-pitch">Ready</span>
              ) : (
                "Not ready"
              )}
            </p>
          </div>

          {/* Host controls — only show for other players */}
          {isHost && player.id !== currentPlayerId && (
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => onTransferHost?.(player.id)}
                className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center"
                title="Make host"
              >
                <ArrowRightLeft size={13} className="text-muted" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => onKick?.(player.id)}
                className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center"
                title="Kick player"
              >
                <X size={13} className="text-danger" />
              </motion.button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
