import { useState } from "react";

export function ShareMenu({
  title,
  text,
  className,
}: {
  title: string;
  text?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const nativeShare = async () => {
    if (
      typeof navigator !== "undefined" &&
      (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share
    ) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title,
          text,
          url,
        });
        return;
      } catch {
        /* dismissed */
      }
    }
    setOpen((v) => !v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={nativeShare}
        className={
          className ??
          "px-5 py-3 border-2 border-foreground text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
        }
        aria-haspopup="menu"
        aria-expanded={open}
      >
        ↗ Share
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 z-40 w-56 bg-background border-2 border-foreground shadow-xl"
        >
          <button
            onClick={copy}
            className="w-full text-left px-4 py-3 text-xs font-bold uppercase hover:bg-foreground hover:text-background border-b border-foreground/10"
          >
            {copied ? "✓ Link copied" : "Copy link"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
            target="_blank"
            rel="noreferrer"
            className="block px-4 py-3 text-xs font-bold uppercase hover:bg-foreground hover:text-background border-b border-foreground/10"
          >
            WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
            className="block px-4 py-3 text-xs font-bold uppercase hover:bg-foreground hover:text-background border-b border-foreground/10"
          >
            X / Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
            className="block px-4 py-3 text-xs font-bold uppercase hover:bg-foreground hover:text-background"
          >
            Facebook
          </a>
        </div>
      )}
    </div>
  );
}
