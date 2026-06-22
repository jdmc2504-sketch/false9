"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="neon-card w-9 h-9 rounded-xl flex items-center justify-center"
    >
      {theme === "dark" ? <Sun size={15} className="text-pitch" /> : <Moon size={15} />}
    </motion.button>
  );
}
