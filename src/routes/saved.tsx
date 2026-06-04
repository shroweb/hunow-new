import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useBookmarks, toggleSaved, syncWithServer } from "@/lib/bookmarks";
import { useHistory } from "@/lib/reading-history";
import { articlePath } from "@/lib/taxonomy";
import { getServerSavedItems } from "@/lib/saved.functions";
import { getCurrentUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "My HU NOW — Saved" },
      { name: "description", content: "Your saved Hull events, places, stories and offers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SavedPage,
});

const KIND_LABELS = {
  event: { label: "Event", path: "/events" },
  place: { label: "Place", path: "/places" },
  story: { label: "Story", path: "/stories" },
  offer: { label: "Offer", path: "/offers" },
} as const;

function SavedPage() {
  const items = useBookmarks();
  const history = useHistory();

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) return;
      getServerSavedItems().then((serverItems) => {
        if (serverItems.length > 0) syncWithServer(serverItems);
      }).catch(() => {});
    }).catch(() => {});
  }, []);
  const grouped = (Object.keys(KIND_LABELS) as Array<keyof typeof KIND_LABELS>).map((k) => ({
    kind: k,
    items: items.filter((i) => i.kind === k),
  }));

  return (
    <PublicLayout>
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">Your collection</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">My HU NOW</h1>
        <p className="text-lg text-muted-foreground mb-10">
          Everything you've saved, kept locally on this device.
        </p>

        {items.length === 0 && (
          <div className="border-2 border-dashed border-foreground/30 p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't saved anything yet.</p>
            <Link to="/listings" className="underline font-bold uppercase text-xs tracking-widest">
              Browse listings →
            </Link>
          </div>
        )}

        {grouped.map(
          ({ kind, items: list }) =>
            list.length > 0 && (
              <div key={kind} className="mb-10">
                <h2 className="text-2xl font-display uppercase border-b-2 border-foreground pb-2 mb-4">
                  {KIND_LABELS[kind].label}s
                </h2>
                <ul className="divide-y divide-foreground/10">
                  {list.map((i) => (
                    <li
                      key={`${i.kind}-${i.id}`}
                      className="flex items-center justify-between py-3 gap-4"
                    >
                      <a
                        href={
                          kind === "story"
                            ? articlePath({ subcategory: i.subcategory, slug: i.slug })
                            : `${KIND_LABELS[kind].path}/${i.slug}`
                        }
                        className="font-bold hover:underline truncate"
                      >
                        {i.title}
                      </a>
                      <button
                        onClick={() => toggleSaved(i)}
                        className="text-[10px] font-bold uppercase underline text-muted-foreground hover:text-foreground shrink-0"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ),
        )}
      </section>

      {history.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-display uppercase border-b-2 border-foreground pb-2 mb-4">
            Recently Viewed
          </h2>
          <ul className="divide-y divide-foreground/10">
            {history.map((h) => {
              const href =
                h.kind === "article"
                  ? articlePath({ subcategory: h.subcategory, slug: h.slug })
                  : h.kind === "event"
                  ? `/events/${h.slug}`
                  : `/places/${h.slug}`;
              return (
                <li key={`${h.kind}-${h.id}`} className="flex items-center justify-between py-3 gap-4">
                  <a href={href} className="font-bold hover:underline truncate">{h.title}</a>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground shrink-0">
                    {h.kind}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </PublicLayout>
  );
}
