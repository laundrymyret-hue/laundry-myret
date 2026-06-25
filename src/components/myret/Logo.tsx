interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

/**
 * MyRet Laundry monogram — geometric "M L" mark.
 * Red angular M + royal blue L, echoing the brand logo.
 */
export function Logo({ className, variant = "default" }: LogoProps) {
  const blue = variant === "light" ? "#ffffff" : "var(--brand-blue)";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        viewBox="0 0 48 28"
        className="h-8 w-auto"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 25 L3 3 L14.5 16.5 L26 3 L26 25"
          stroke="var(--brand-red)"
          strokeWidth="4.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 3 L32 25 L45 25"
          stroke={blue}
          strokeWidth="4.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="font-display text-xl font-extrabold tracking-tight"
        style={{ color: variant === "light" ? "#ffffff" : "var(--brand-midnight)" }}
      >
        MyRet
      </span>
    </span>
  );
}
