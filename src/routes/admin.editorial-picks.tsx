import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminHeader, AdminTable } from "@/components/admin/AdminLayout";
import { articlePath } from "@/lib/taxonomy";
import { setState, slugify, uid, useStore } from "@/lib/store";
import type { CollectionItemKind, EditorialCollectionItem } from "@/types";

export const Route = createFileRoute("/admin/editorial-picks")({
  component: AdminEditorialPicks,
});

function AdminEditorialPicks() {
  const articles = useStore((s) => s.articles);
  const events = useStore((s) => s.events);
  const listings = useStore((s) => s.listings);
  const offers = useStore((s) => s.offers);
  const collections = useStore((s) => s.collections);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [selected, setSelected] = useState<EditorialCollectionItem[]>([]);

  function toggleItem(item: EditorialCollectionItem) {
    setSelected((current) =>
      current.some((selectedItem) => selectedItem.kind === item.kind && selectedItem.id === item.id)
        ? current.filter(
            (selectedItem) => !(selectedItem.kind === item.kind && selectedItem.id === item.id),
          )
        : [...current, item],
    );
  }

  function saveCollection() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || selected.length === 0) return;
    const now = new Date().toISOString();
    setState((s) => ({
      ...s,
      collections: [
        {
          id: uid(),
          title: trimmedTitle,
          slug: slugify(trimmedTitle),
          description: description.trim(),
          status,
          items: selected,
          updatedAt: now,
        },
        ...s.collections,
      ],
    }));
    setTitle("");
    setDescription("");
    setStatus("draft");
    setSelected([]);
  }

  return (
    <div>
      <AdminHeader
        title="Editorial Picks"
        subtitle="Control featured stories, events, places and offers used across homepage modules."
      />
      <div className="p-6 md:p-10 space-y-8">
        <section className="border-2 border-foreground bg-white p-5 space-y-4">
          <div>
            <h2 className="font-display text-3xl uppercase">Collections</h2>
            <p className="text-sm text-muted-foreground">
              Build public bundles like date night, rainy day Hull or new openings.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Collection title"
              className="border-2 border-foreground bg-background px-3 py-2 text-sm"
            />
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short description"
              className="border-2 border-foreground bg-background px-3 py-2 text-sm"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "draft" | "published")}
              className="border-2 border-foreground bg-background px-3 py-2 text-sm font-bold uppercase"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <MiniPicker
              title="Stories"
              items={articles.map((item) => ({ id: item.id, label: item.title }))}
              kind="article"
              selected={selected}
              onToggle={toggleItem}
            />
            <MiniPicker
              title="Events"
              items={events.map((item) => ({ id: item.id, label: item.title }))}
              kind="event"
              selected={selected}
              onToggle={toggleItem}
            />
            <MiniPicker
              title="Places"
              items={listings.map((item) => ({ id: item.id, label: item.name }))}
              kind="listing"
              selected={selected}
              onToggle={toggleItem}
            />
            <MiniPicker
              title="Offers"
              items={offers.map((item) => ({ id: item.id, label: item.title }))}
              kind="offer"
              selected={selected}
              onToggle={toggleItem}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveCollection}
              className="bg-foreground text-background px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
            >
              Create Collection
            </button>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              {selected.length} selected
            </span>
          </div>
          {collections.length > 0 && (
            <AdminTable
              headers={["Title", "Items", "Status", "Updated", "Actions"]}
              rows={collections.map((collection) => [
                <span className="font-bold">{collection.title}</span>,
                collection.items.length,
                collection.status,
                new Date(collection.updatedAt).toLocaleDateString("en-GB"),
                <div className="flex gap-2">
                  {collection.status === "published" && (
                    <Link
                      to="/collections/$slug"
                      params={{ slug: collection.slug }}
                      className="text-[10px] font-bold uppercase underline"
                    >
                      View
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        collections: s.collections.map((item) =>
                          item.id === collection.id
                            ? {
                                ...item,
                                status: item.status === "published" ? "draft" : "published",
                                updatedAt: new Date().toISOString(),
                              }
                            : item,
                        ),
                      }))
                    }
                    className="text-[10px] font-bold uppercase underline"
                  >
                    {collection.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        collections: s.collections.filter((item) => item.id !== collection.id),
                      }))
                    }
                    className="text-[10px] font-bold uppercase underline"
                  >
                    Delete
                  </button>
                </div>,
              ])}
            />
          )}
        </section>
        <PickTable
          title="Stories"
          headers={["Story", "Status", "Featured", "Preview"]}
          rows={articles.map((item) => [
            item.title,
            item.status,
            <PickToggle
              checked={item.isFeatured}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  articles: s.articles.map((article) =>
                    article.id === item.id
                      ? { ...article, isFeatured: !article.isFeatured }
                      : article,
                  ),
                }))
              }
            />,
            <a href={articlePath(item)} className="text-[10px] font-bold uppercase underline">
              View
            </a>,
          ])}
        />
        <PickTable
          title="Events"
          headers={["Event", "Date", "Featured", "Preview"]}
          rows={events.map((item) => [
            item.title,
            item.startDate,
            <PickToggle
              checked={item.isFeatured}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  events: s.events.map((event) =>
                    event.id === item.id ? { ...event, isFeatured: !event.isFeatured } : event,
                  ),
                }))
              }
            />,
            <Link
              to="/events/$slug"
              params={{ slug: item.slug }}
              className="text-[10px] font-bold uppercase underline"
            >
              View
            </Link>,
          ])}
        />
        <PickTable
          title="Places"
          headers={["Place", "Area", "Featured", "Preview"]}
          rows={listings.map((item) => [
            item.name,
            item.area,
            <PickToggle
              checked={item.isFeatured}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  listings: s.listings.map((listing) =>
                    listing.id === item.id
                      ? { ...listing, isFeatured: !listing.isFeatured }
                      : listing,
                  ),
                }))
              }
            />,
            <Link
              to="/places/$slug"
              params={{ slug: item.slug }}
              className="text-[10px] font-bold uppercase underline"
            >
              View
            </Link>,
          ])}
        />
        <PickTable
          title="Offers"
          headers={["Offer", "Business", "Featured", "Status"]}
          rows={offers.map((item) => [
            item.title,
            item.businessName,
            <PickToggle
              checked={!!item.isFeatured}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  offers: s.offers.map((offer) =>
                    offer.id === item.id ? { ...offer, isFeatured: !offer.isFeatured } : offer,
                  ),
                }))
              }
            />,
            item.status,
          ])}
        />
      </div>
    </div>
  );
}

function MiniPicker({
  title,
  kind,
  items,
  selected,
  onToggle,
}: {
  title: string;
  kind: CollectionItemKind;
  items: Array<{ id: string; label: string }>;
  selected: EditorialCollectionItem[];
  onToggle: (item: EditorialCollectionItem) => void;
}) {
  return (
    <div className="border border-foreground/20 p-3">
      <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest mb-2">{title}</h3>
      <div className="max-h-52 overflow-y-auto space-y-1">
        {items.map((item) => {
          const checked = selected.some((s) => s.kind === kind && s.id === item.id);
          return (
            <label key={item.id} className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle({ kind, id: item.id })}
                className="mt-0.5"
              />
              <span>{item.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function PickTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <section>
      <h2 className="font-display text-3xl uppercase mb-3">{title}</h2>
      <AdminTable headers={headers} rows={rows} />
    </section>
  );
}

function PickToggle({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[10px] font-bold uppercase px-3 py-1 ${
        checked ? "bg-accent text-background" : "border border-foreground/30"
      }`}
    >
      {checked ? "Featured" : "Feature"}
    </button>
  );
}
