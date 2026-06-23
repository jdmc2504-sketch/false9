"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Users, Zap, Settings, Lock, Sun, Moon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Onboarding } from "@/components/onboarding";
import { getHasOnboarded } from "@/lib/storage";
import { useTheme } from "@/components/theme-provider";

export default function HomePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    if (!getHasOnboarded()) setShowOnboarding(true);
  }, []);

  return (
    <main className="flex-1 flex flex-col safe-top safe-bottom relative overflow-hidden">

      {/* Stadium background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/stadium.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay so text/UI stays readable */}
      <div className="absolute inset-0 z-0 bg-black/55" />

      {/* Top bar */}
      <div className="flex justify-between items-center p-5 relative z-10">
        <div className="hud-badge">Beta v1.0</div>

        {/* Settings cog */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowSettings(true)}
          className="neon-card w-10 h-10 rounded-xl flex items-center justify-center"
          aria-label="Settings"
        >
          <Settings size={16} className="text-muted" />
        </motion.button>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl neon-card mb-6 relative">
            <span className="text-5xl font-black text-pitch neon-text">F</span>
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-pitch flex items-center justify-center neon-glow">
              <span className="text-xl font-black text-black">9</span>
            </div>
          </div>

          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-1">
            False<span className="text-pitch neon-text">9</span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted mt-2">
            Football Imposter Game
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-xs mb-10"
        >
          <Link href="/create" className="block">
            <Button size="lg" className="w-full text-base">
              Start Game
            </Button>
          </Link>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-3 gap-3 w-full max-w-xs"
        >
          {[
            { icon: Users, label: "3–12",  sub: "Players"  },
            { icon: Shield, label: "4",     sub: "Modes"    },
            { icon: Zap,    label: "220+",  sub: "Entities" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={sub} className="neon-card p-3 flex flex-col items-center gap-1 text-center">
              <Icon size={15} className="text-pitch" />
              <span className="text-lg font-black text-pitch leading-none">{label}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{sub}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom tagline */}
      <div className="pb-6 text-center relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted opacity-40">
          Pass the phone · Spot the imposter
        </p>
      </div>

      {/* ── Settings bottom sheet ── */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="fixed bottom-0 inset-x-0 z-50 p-4 safe-bottom"
            >
              <div className="neon-card p-2 max-w-sm mx-auto">

                {/* Sheet header */}
                <div className="flex items-center justify-between px-3 py-2.5 mb-1">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-muted">
                    Settings
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSettings(false)}
                    className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center"
                  >
                    <X size={13} className="text-muted" />
                  </motion.button>
                </div>

                {/* Admin Panel row */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowSettings(false); router.push("/admin"); }}
                  className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-surface-2 active:bg-surface-2 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
                    <Lock size={16} className="text-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide">Admin Panel</p>
                    <p className="text-xs text-muted">Add or edit content</p>
                  </div>
                </motion.button>

                {/* Theme toggle row */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-surface-2 active:bg-surface-2 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
                    {theme === "dark"
                      ? <Sun size={16} className="text-pitch" />
                      : <Moon size={16} className="text-muted" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide">
                      Switch to {theme === "dark" ? "Light" : "Dark"} Mode
                    </p>
                    <p className="text-xs text-muted">
                      Currently {theme} mode
                    </p>
                  </div>
                </motion.button>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
    </main>
  );
}
