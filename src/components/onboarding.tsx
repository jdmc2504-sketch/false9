"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { setHasOnboarded } from "@/lib/storage";

const SLIDES = [
  {
    emoji: "🕵️",
    title: "One Is The Imposter",
    body: "Everyone gets the same footballer, club, or manager — except one secret False 9, who only gets a vague hint.",
  },
  {
    emoji: "📱",
    title: "Pass The Phone",
    body: "Hand the phone around. Each player secretly reveals their role, then hides the screen before passing on.",
  },
  {
    emoji: "🗳️",
    title: "Vote & Expose",
    body: "Discuss, drop clues, then vote on who you think the False 9 is. The group wins if they catch the imposter.",
  },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;
  const finish = () => { setHasOnboarded(); onDone(); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="neon-card w-full max-w-sm p-6 safe-bottom"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className="text-center py-4"
          >
            <div className="text-5xl mb-4">{SLIDES[step].emoji}</div>
            <h2 className="text-xl font-black uppercase tracking-tight mb-2">
              {SLIDES[step].title}
            </h2>
            <p className="text-sm text-muted leading-relaxed">{SLIDES[step].body}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 my-4">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === step ? "w-8 bg-pitch" : "w-1 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {!isLast && (
            <Button variant="ghost" size="md" className="flex-1" onClick={finish}>
              Skip
            </Button>
          )}
          <Button size="md" className="flex-1" onClick={() => isLast ? finish() : setStep((s) => s + 1)}>
            {isLast ? "Let's Play" : "Next"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
