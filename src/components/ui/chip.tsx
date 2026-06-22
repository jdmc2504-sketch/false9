"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={cn(
        "shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all",
        selected
          ? "bg-pitch text-black border-pitch neon-glow"
          : "bg-surface-2 text-muted border-border hover:border-pitch hover:text-foreground"
      )}
    >
      {label}
    </motion.button>
  );
}
