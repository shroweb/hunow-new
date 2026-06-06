import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useBookmarks, toggleSaved, syncWithServer, type SavedItem } from "@/lib/bookmarks";
import { useHistory, type HistoryItem } from "@/lib/reading-history";
import { articlePath } from "@/lib/taxonomy";
import { getServerSavedItems } from "@/lib/saved.functions";
import { getCurrentUser } from "@/lib/auth.functions";

type Tab = "events" | "places" | "stories" | "offers" | "history";

const TABS: { id: Tab; label: string; kind?: SavedItem["kind"] }[] = [
  { id: "events", label: "Events", kind: "event" },
  { id: "places", label: "Places", kind: "place" },
  { id: "stories", label: "Stories", kind: "story" },
  { id: "offers", label: "Offers", kind: "offer" },
  { id: "history", label: "History" },
];

const KIND_PATH: Record<SavedItem["kind"], string> = {
  event: "/events",
  place: "/places",
  story: "/stories",
  offer: "/offers",
};

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved — HU NOW" },
      { name: "description", content: "Your saved Hull events, places, stories and offers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const items = useBookmarks();
  const history = useHistory();
  const [tab, setTab] = useState<Tab>("events");

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (!user) return;
        getServerSavedItems()
          .then((serverItems) => { if (serverItems.length > 0) syncWithServer(serverItems); })
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  // Automatically switch to first tab that has items
  useEffect(() => {
    const first = TABS.find((t) =>
      t.kind ? items.some((i) => i.kind === t.kind) : history.length > 0,
    );
    if (first) setTab(first.id);
  }, [items.length, history.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts: Record<Tab, number> = {
    events: items.filter((i) => i.kind === "event").length,
    places: items.filter((i) => i.kind === "place").length,
    stories: items.filter((i) => i.kind === "story").length,
    offers: items.filter((i) => i.kind === "offer").length,
    history: history.length,
  };

  const total = items.length;

  return (
    <PublicLayout>
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-20 border-b-2 border-foreground">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Your collection</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-3">My HU NOW</h1>
        <p className="text-lg text-muted-foreground">
          {total === 0 ? "Nothing saved yet." : `${total} saved item${total !== 1 ? "s" : ""}`}
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4">
        {/* Tab bar */}
        <div className="flex border-b-2 border-foreground overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 -mb-[2px] transition-colors ${
                tab === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-foreground/50 hover:text-foreground"
              }`}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${tab === t.id ? "bg-accent/20 text-accent" : "bg-foreground/10"}`}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === "history" ? (
            <HistoryList history={history} />
          ) : (
            <SavedList
              items={items.filter((i) => i.kind === TABS.find((t) => t.id === tab)?.kind)}
              tab={tab}
            />
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

function SavedList({ items, tab }: { items: SavedItem[]; tab: Tab }) {
  if (items.length === 0) {
    const hints: Record<Tab, { label: string; to: string }> = {
      events: { label: "Browse events", to: "/whats-on" },
      places: { label: "Browse places", to: "/places" },
      stories: { label: "Browse stories", to: "/stories" },
      offers: { label: "Browse offers", to: "/offers" },
      history: { label: "Explore", to: "/" },
    };
    const hint = hints[tab];
    return (
      <div className="border-2 border-dashed border-foreground/20 p-12 text-center space-y-4">
        <p className="text-muted-foreground text-sm">Nothing saved here yet.</p>
        <Link to={hint.to} className="inline-block font-bold uppercase text-xs tracking-widest underline">
          {hint.label} →
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-foreground/10">
      {items.map((i) => {
        const href =
          i.kind === "story"
            ? articlePath({ subcategory: i.subcategory, slug: i.slug })
            : `${KIND_PATH[i.kind]}/${i.slug}`;
        return (
          <li key={`${i.kind}-${i.id}`} className="flex items-center justify-between py-4 gap-4">
            <a href={href} className="font-bold hover:underline truncate flex-1">
              {i.title}
            </a>
            <button
              type="button"
              onClick={() => toggleSaved(i)}
              className="text-[10px] font-bold uppercase text-muted-foreground hover:text-red-600 transition-colors shrink-0"
            >
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function HistoryList({ history }: { history: HistoryItem[] }) {
  if (history.length === 0) {
    return (
      <div className="border-2 border-dashed border-foreground/20 p-12 text-center">
        <p className="text-muted-foreground text-sm">No reading history yet.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-foreground/10">
      {history.map((h) => {
        const href =
          h.kind === "article"
            ? articlePath({ subcategory: h.subcategory, slug: h.slug })
            : h.kind === "event"
              ? `/events/${h.slug}`
              : `/places/${h.slug}`;
        return (
          <li key={`${h.kind}-${h.id}`} className="flex items-center justify-between py-4 gap-4">
            <a href={href} className="font-bold hover:underline truncate flex-1">
              {h.title}
            </a>
            <span className="font-mono text-[10px] uppercase text-muted-foreground shrink-0">
              {h.kind}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
