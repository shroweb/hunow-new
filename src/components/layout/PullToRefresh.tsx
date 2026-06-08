import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const THRESHOLD = 72; // px to pull before triggering refresh

type Phase = "idle" | "pulling" | "ready" | "refreshing";

export function PullToRefresh() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0); // 0–1 during pulling

  // Refs to avoid stale closures in event listeners
  const phaseRef = useRef<Phase>("idle");
  const startYRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  const updatePhase = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const updateProgress = (p: number) => {
    progressRef.current = p;
    setProgress(p);
  };

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && phaseRef.current === "idle") {
        startYRef.current = e.touches[0].clientY;
        updatePhase("pulling");
        updateProgress(0);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (phaseRef.current !== "pulling" && phaseRef.current !== "ready") return;
      if (startYRef.current === null) return;

      // If user scrolled down mid-gesture, abandon
      if (window.scrollY > 0) {
        startYRef.current = null;
        updatePhase("idle");
        updateProgress(0);
        return;
      }

      const dy = e.touches[0].clientY - startYRef.current;
      if (dy <= 0) {
        updateProgress(0);
        updatePhase("idle");
        return;
      }

      // Prevent default only while we're consuming the pull
      e.preventDefault();

      const p = Math.min(dy / THRESHOLD, 1);
      updateProgress(p);
      updatePhase(p >= 1 ? "ready" : "pulling");
    };

    const onTouchEnd = async () => {
      if (phaseRef.current === "ready") {
        updatePhase("refreshing");
        updateProgress(0);
        startYRef.current = null;
        await router.invalidate();
        updatePhase("idle");
      } else {
        updatePhase("idle");
        updateProgress(0);
        startYRef.current = null;
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]);

  if (phase === "idle") return null;

  const translateY = phase === "refreshing" ? 16 : progress * 56;
  const opacity = phase === "refreshing" ? 1 : progress;
  // Arrow rotates from pointing-down (0°) to pointing-up (180°) as progress hits 1
  const arrowRotate = phase === "ready" ? 180 : progress * 180;

  return (
    <div
      className="fixed left-0 right-0 z-[200] flex justify-center pointer-events-none"
      style={{ top: "env(safe-area-inset-top)" }}
    >
      <div
        className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg"
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {phase === "refreshing" ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-spin"
          >
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: `rotate(${arrowRotate}deg)`,
              transition: "transform 0.15s ease",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </div>
    </div>
  );
}
