import { useEffect, useState } from "react";
import { img } from "@/data/seed";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState<number | null>(null);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowRight") setIdx((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === "ArrowLeft")
        setIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className="aspect-square overflow-hidden border-2 border-foreground bg-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`Open photo ${i + 1} of ${images.length}`}
          >
            <img
              src={img(src, 400, 400)}
              alt={`${alt} – photo ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </button>
        ))}
      </div>

      {idx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} photo viewer`}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIdx(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx(null);
            }}
            aria-label="Close"
            className="absolute top-4 right-4 text-white text-xl border-2 border-white px-3 py-1 hover:bg-white hover:text-black"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
            }}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl border-2 border-white w-12 h-12 hover:bg-white hover:text-black"
          >
            ‹
          </button>
          <img
            src={img(images[idx], 1600, 1200)}
            alt={`${alt} – photo ${idx + 1}`}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((i) => (i === null ? null : (i + 1) % images.length));
            }}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl border-2 border-white w-12 h-12 hover:bg-white hover:text-black"
          >
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs font-mono uppercase tracking-widest">
            {idx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
