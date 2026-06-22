import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  onClick,
  glow = false,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "neon-card p-5",
        glow && "neon-glow",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
