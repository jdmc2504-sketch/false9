"use client";

import { motion } from "framer-motion";

const FOOTBALL_EMOJIS = [
  "⚽", "🥅", "🏆", "🥇", "🎽", "👟", "🦅", "🐺", "🦁", "🐯",
  "🔥", "⚡", "💥", "🌟", "👑", "🎯", "🛡️", "⚔️", "🏹", "🎪",
  "🦊", "🐻", "🦝", "🐼", "🦄", "🐲", "🦈", "🦅", "🦋", "🎭",
];

// Deduplicate
const AVATARS = Array.from(new Set(FOOTBALL_EMOJIS));

interface AvatarPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVATARS.map((emoji) => (
        <motion.button
          key={emoji}
          whileTap={{ scale: 0.85 }}
          onClick={() => onSelect(emoji)}
          className={`
            w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all
            ${selected === emoji
              ? "bg-pitch/20 border-2 border-pitch neon-glow"
              : "bg-surface-2 border-2 border-transparent"
            }
          `}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
