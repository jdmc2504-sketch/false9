"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RevealCard({
  playerName,
  isFalse9,
  text,
  onHideAndContinue,
}: {
  playerName: string;
  isFalse9: boolean;
  text: string;
  onHideAndContinue: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 hud-bg">

      {/* Player label */}
      <p className="text-xs font-black uppercase tracking-[0.25em] text-muted mb-1">
        {playerName}&apos;s turn
      </p>
      <p className="text-sm font-bold text-muted mb-6">
        {revealed ? "Your role is revealed below" : "Tap the card to reveal"}
      </p>

      {/* Reveal card */}
      <motion.button
        onClick={() => !revealed && setRevealed(true)}
        whileTap={!revealed ? { scale: 0.97 } : {}}
        className="w-full max-w-xs relative"
        style={{ aspectRatio: "3/4" }}
      >
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 neon-card flex flex-col items-center justify-center gap-4 cursor-pointer"
            >
              {/* Animated pulse */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 rounded-full bg-pitch flex items-center justify-center neon-glow"
              >
                <span className="text-3xl font-black text-black">?</span>
              </motion.div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">
                Tap to reveal
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="shown"
              initial={{ opacity: 0, rotateY: -90, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`absolute inset-0 neon-card flex flex-col items-center justify-center gap-5 p-6 ${
                isFalse9 ? "border-danger" : "border-pitch"
              }`}
              style={{
                boxShadow: isFalse9
                  ? "0 0 30px rgba(255,61,90,0.3)"
                  : "0 0 30px rgba(201,240,0,0.2)",
              }}
            >
              {isFalse9 ? (
                <>
                  <div className="px-4 py-1.5 rounded-full bg-danger text-white text-xs font-black uppercase tracking-widest">
                    You are the False 9
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted">
                    Your only hint:
                  </p>
                  <p className="text-4xl font-black uppercase tracking-tight text-center text-danger leading-tight"
                     style={{ textShadow: "0 0 20px rgba(255,61,90,0.5)" }}>
                    {text}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted text-center">
                    Blend in. Don&apos;t get caught.
                  </p>
                </>
              ) : (
                <>
                  <div className="px-4 py-1.5 rounded-full bg-pitch text-black text-xs font-black uppercase tracking-widest">
                    You know the answer
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted">
                    The entity is:
                  </p>
                  <p className="text-4xl font-black uppercase tracking-tight text-center text-pitch leading-tight neon-text">
                    {text}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted text-center">
                    Find the imposter.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Hide button */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xs mt-6"
          >
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={onHideAndContinue}
            >
              <EyeOff size={16} />
              Hide &amp; Pass Phone
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
