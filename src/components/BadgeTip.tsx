import type { ReactNode } from "react";

export function BadgeTip({
  label,
  tip,
  className,
}: {
  label: ReactNode;
  tip: string;
  className?: string;
}) {
  return (
    <span className={`relative group inline-flex items-center ${className ?? ""}`}>
      <span
        tabIndex={0}
        aria-describedby={undefined}
        className="cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {label}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 whitespace-nowrap bg-foreground text-background text-[10px] font-mono uppercase tracking-wider px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
      >
        {tip}
      </span>
    </span>
  );
}
