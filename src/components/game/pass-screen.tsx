"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function PassScreen({
  nextPlayerName,
  subtitle,
  onReveal,
}: {
  nextPlayerName: string;
  subtitle: string;
  onReveal: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col items-center justify-center text-center px-6 hud-bg"
    >
      {/* Pulsing arrow icon */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-20 h-20 rounded-3xl neon-card flex items-center justify-center mb-8"
      >
        <span className="text-4xl">📱</span>
      </motion.div>

      <p className="text-xs font-black uppercase tracking-[0.25em] text-muted mb-3">
        {subtitle}
      </p>

      <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
        Pass to
      </h1>
      <h2 className="text-5xl font-black uppercase tracking-tight text-pitch neon-text mb-10">
        {nextPlayerName}
      </h2>

      <Button size="lg" onClick={onReveal} className="w-full max-w-xs">
        I&apos;m {nextPlayerName} — Ready
      </Button>
    </motion.div>
  );
}
