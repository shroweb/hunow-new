import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { articlePath } from "@/lib/taxonomy";

type ResultKind = "event" | "place" | "story" | "offer" | "section";
interface Result {
  kind: ResultKind;
  title: string;
  sub: string;
  to: string;
}

const RECENT_KEY = "hunow:cmdk:recent";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const events = useStore((s) => s.events);
  const listings = useStore((s) => s.listings);
  const articles = useStore((s) => s.articles);
  const offers = useStore((s) => s.offers);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<ResultKind | "all">("all");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<Result[]>([]);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    setScope("all");
    setTimeout(() => inputRef.current?.focus(), 0);
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    } catch {
      /* ignore */
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    const pool: Result[] = [
      ...events.map((e) => ({
        kind: "event" as const,
        title: e.title,
        sub: `Event · ${e.locationName}`,
        to: `/events/${e.slug}`,
      })),
      ...listings.map((l) => ({
        kind: "place" as const,
        title: l.name,
        sub: `Place · ${l.category} · ${l.area}`,
        to: `/places/${l.slug}`,
      })),
      ...articles.map((a) => ({
        kind: "story" as const,
        title: a.title,
        sub: `Story · ${a.category}`,
        to: articlePath(a),
      })),
      ...offers.map((o) => ({
        kind: "offer" as const,
        title: o.title,
        sub: `Offer · ${o.businessName}`,
        to: `/offers`,
      })),
      { kind: "section", title: "What's On", sub: "Section", to: "/whats-on" },
      { kind: "section", title: "Listings", sub: "Section", to: "/listings" },
      { kind: "section", title: "Stories", sub: "Section", to: "/stories" },
      { kind: "section", title: "Offers", sub: "Section", to: "/offers" },
      { kind: "section", title: "Saved", sub: "Section", to: "/saved" },
    ];
    return pool
      .filter((r) => scope === "all" || r.kind === scope)
      .filter((r) => !term || `${r.title} ${r.sub}`.toLowerCase().includes(term))
      .slice(0, 30);
  }, [q, scope, events, listings, articles, offers]);

  useEffect(() => {
    setActive(0);
  }, [q, scope]);

  const choose = (r: Result) => {
    const next = [r, ...recent.filter((x) => x.to !== r.to)].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    onClose();
    navigate({ to: r.to });
  };

  if (!open) return null;

  const showRecent = q.trim() === "" && recent.length > 0 && scope === "all";
  const items = showRecent ? recent : results;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search HU NOW"
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-background border-2 border-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b-2 border-foreground">
          <span className="px-4 text-muted-foreground font-mono text-xs uppercase">⌘K</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(items.length - 1, a + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              }
              if (e.key === "Enter") {
                e.preventDefault();
                if (items[active]) {
                  choose(items[active]);
                } else if (q.trim()) {
                  onClose();
                  navigate({ to: "/search", search: { q: q.trim() } });
                }
              }
            }}
            placeholder="Search events, places, stories, offers..."
            className="flex-1 bg-transparent px-2 py-4 font-mono text-sm focus:outline-none"
            aria-label="Search query"
          />
        </div>
        <div className="flex gap-1 p-2 border-b border-foreground/10 overflow-x-auto">
          {(
            [
              ["all", "All"],
              ["event", "Events"],
              ["place", "Places"],
              ["story", "Stories"],
              ["offer", "Offers"],
              ["section", "Sections"],
            ] as [ResultKind | "all", string][]
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setScope(k)}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase ${scope === k ? "bg-foreground text-background" : "border border-foreground/20"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <ul role="listbox" className="max-h-[50vh] overflow-y-auto">
          {showRecent && (
            <li className="px-4 py-2 text-[10px] font-mono uppercase text-muted-foreground">
              Recent
            </li>
          )}
          {items.length === 0 && q.trim() && (
            <li>
              <button
                type="button"
                onClick={() => { onClose(); navigate({ to: "/search", search: { q: q.trim() } }); }}
                className="w-full text-left px-4 py-4 flex items-center justify-between gap-3 hover:bg-accent/10"
              >
                <div>
                  <div className="font-bold">Search for &ldquo;{q.trim()}&rdquo;</div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Full results page</div>
                </div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground shrink-0">↵</span>
              </button>
            </li>
          )}
          {items.length === 0 && !q.trim() && (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">Start typing to search…</li>
          )}
          {items.map((r, i) => (
            <li key={`${r.kind}-${r.to}-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(r)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 border-b border-foreground/5 ${i === active ? "bg-accent/10" : ""}`}
              >
                <div className="min-w-0">
                  <div className="font-bold truncate">{r.title}</div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">
                    {r.sub}
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground shrink-0">
                  ↵
                </span>
              </button>
            </li>
          ))}
        </ul>
        {q.trim() && items.length > 0 && (
          <div className="border-t border-foreground/10">
            <button
              type="button"
              onClick={() => { onClose(); navigate({ to: "/search", search: { q: q.trim() } }); }}
              className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5 transition-colors"
            >
              See all results for &ldquo;{q.trim()}&rdquo; →
            </button>
          </div>
        )}
        <div className="px-4 py-2 border-t border-foreground/10 text-[10px] font-mono uppercase text-muted-foreground flex justify-between">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{items.length} result{items.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
