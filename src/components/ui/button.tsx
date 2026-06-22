"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-pitch text-black font-black uppercase tracking-widest shadow-lg hover:bg-pitch-2 active:scale-95",
  secondary:
    "glass text-foreground font-bold uppercase tracking-wider border border-border",
  ghost:
    "bg-transparent text-muted font-bold uppercase tracking-wider hover:text-foreground",
  danger:
    "bg-danger text-white font-black uppercase tracking-widest",
  accent:
    "bg-accent text-white font-black uppercase tracking-widest shadow-lg",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-4 py-2.5 rounded-xl",
  md: "text-sm px-6 py-3.5 rounded-2xl",
  lg: "text-base px-8 py-4 rounded-2xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 select-none transition-colors disabled:opacity-40 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
