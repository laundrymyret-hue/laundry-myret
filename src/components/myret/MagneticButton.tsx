import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";

interface MagneticButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  href?: string;
  onClick?: () => void;
}

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-300 cursor-pointer whitespace-nowrap select-none";

const sizes: Record<string, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

const variants: Record<string, string> = {
  primary: "bg-gradient-brand text-white shadow-glow-red hover:brightness-110",
  secondary:
    "bg-white/80 text-[color:var(--brand-blue)] border border-[color:var(--border)] hover:bg-white",
  ghost: "text-white border border-white/25 hover:bg-white/10",
};

export function MagneticButton({
  children,
  variant = "primary",
  size = "md",
  className,
  href,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.3}px)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  return (
    <motion.a
      ref={ref}
      href={href ?? "#"}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className ?? ""}`}
      style={{ transition: "transform 0.2s ease-out, filter 0.3s, background 0.3s" }}
    >
      {children}
    </motion.a>
  );
}
