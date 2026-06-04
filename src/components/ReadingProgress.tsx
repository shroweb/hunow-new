import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-accent transition-[width] duration-75"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
