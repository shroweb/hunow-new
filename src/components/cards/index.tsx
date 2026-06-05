import { Link } from "@tanstack/react-router";
import { img } from "@/data/seed";
import type { Article, EventItem, Listing, Offer } from "@/types";
import { useIsSaved, toggleSaved } from "@/lib/bookmarks";
import { articlePath } from "@/lib/taxonomy";
import { openStatus } from "@/lib/hours";

function HeartButton({
  saved,
  onClick,
  label,
}: {
  saved: boolean;
  onClick: (e: React.MouseEvent) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      onClick={onClick}
      className={`absolute top-3 right-3 size-9 grid place-items-center text-base border-2 border-foreground transition-colors ${saved ? "bg-accent text-background" : "bg-background/90 hover:bg-foreground hover:text-background"}`}
    >
      {saved ? "★" : "☆"}
    </button>
  );
}

function catColor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("music")) return "text-accent";
  if (c.includes("food") || c.includes("drink") || c.includes("eat"))
    return "text-[oklch(0.58_0.15_145)]";
  if (c.includes("art")) return "text-[oklch(0.50_0.20_290)]";
  if (c.includes("culture") || c.includes("interview")) return "text-[oklch(0.55_0.18_230)]";
  return "text-accent";
}

export function EventCard({ event }: { event: EventItem }) {
  const date = new Date(event.startDate);
  const dateLabel = date
    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    .toUpperCase();
  const saved = useIsSaved("event", event.id);
  return (
    <Link to="/events/$slug" params={{ slug: event.slug }} className="group block">
      <div className="w-full aspect-video bg-stone-200 mb-4 overflow-hidden border border-foreground/5 relative">
        <img
          src={img(event.featuredImage, 800, 500)}
          alt={`${event.title} at ${event.locationName}`}
          width={800}
          height={500}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {event.isSponsored && (
          <span className="absolute top-3 left-3 bg-accent text-background text-[9px] font-bold uppercase px-2 py-0.5">
            Sponsored
          </span>
        )}
        <HeartButton
          saved={saved}
          label={saved ? `Remove ${event.title} from saved` : `Save ${event.title}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved({ kind: "event", id: event.id, slug: event.slug, title: event.title });
          }}
        />
      </div>
      <div
        className={`flex gap-3 mb-2 font-mono text-[10px] font-bold uppercase ${catColor(event.category)}`}
      >
        <span>{event.category}</span>
        <span className="text-foreground/30">•</span>
        <span className="text-foreground">
          {dateLabel} / {event.startTime}
        </span>
      </div>
      <h3 className="text-2xl font-bold leading-tight group-hover:underline mb-2">{event.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
    </Link>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  const saved = useIsSaved("story", article.id);
  return (
    <a href={articlePath(article)} className="group block space-y-4">
      <div className="w-full aspect-square bg-stone-200 overflow-hidden relative">
        <img
          src={img(article.featuredImage, 800, 800)}
          alt={`${article.title} — illustration`}
          width={800}
          height={800}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <HeartButton
          saved={saved}
          label={saved ? `Remove ${article.title} from saved` : `Save ${article.title}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved({
              kind: "story",
              id: article.id,
              slug: article.slug,
              title: article.title,
              subcategory: article.subcategory,
            });
          }}
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-block text-[10px] font-mono font-bold uppercase bg-foreground text-background px-2 py-1">
          {article.category}
        </span>
        {article.series && (
          <span className="text-[10px] font-mono uppercase text-accent">
            {article.series}
            {article.seriesOrder ? ` · Part ${article.seriesOrder}` : ""}
          </span>
        )}
      </div>
      <h3 className="text-2xl md:text-3xl font-bold leading-none group-hover:underline">
        {article.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
      <div className="text-[10px] font-mono uppercase text-muted-foreground">
        {article.author} · {article.readingMinutes} min read
      </div>
    </a>
  );
}

export function ListingCard({ listing }: { listing: Listing }) {
  const saved = useIsSaved("place", listing.id);
  const status = listing.hours ? openStatus(listing.hours) : null;
  return (
    <Link to="/places/$slug" params={{ slug: listing.slug }} className="group block">
      <div className="w-full aspect-[4/3] bg-stone-200 mb-3 overflow-hidden relative">
        <img
          src={img(listing.featuredImage, 600, 450)}
          alt={`${listing.name} — ${listing.category} in ${listing.area}`}
          width={600}
          height={450}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {listing.isHiddenGem && (
          <span className="absolute top-3 left-3 bg-foreground text-background text-[9px] font-bold uppercase px-2 py-0.5">
            Hidden Gem
          </span>
        )}
        {listing.activeOfferId && (
          <span className="absolute top-3 left-3 mt-7 bg-accent text-background text-[9px] font-bold uppercase px-2 py-0.5">
            Offer
          </span>
        )}
        <HeartButton
          saved={saved}
          label={saved ? `Remove ${listing.name} from saved` : `Save ${listing.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved({ kind: "place", id: listing.id, slug: listing.slug, title: listing.name });
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="text-[10px] font-mono font-bold uppercase text-accent">
          {listing.category} · {listing.area}
        </div>
        {status && (
          <span
            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 shrink-0 ${status.open ? "bg-[oklch(0.58_0.15_145)] text-background" : "border border-foreground/20 text-muted-foreground"}`}
          >
            {status.open ? "Open" : "Closed"}
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold leading-tight group-hover:underline">{listing.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{listing.description}</p>
    </Link>
  );
}

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="p-4 border border-foreground/10 bg-accent/5 flex items-center gap-4 group">
      <div className="size-16 shrink-0 bg-accent grid place-items-center text-background font-display text-2xl">
        %
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase text-accent">{offer.businessName}</div>
        <div className="font-bold truncate">{offer.title}</div>
        <div className="text-[10px] font-mono uppercase text-muted-foreground mt-1">
          Ends {new Date(offer.endDate).toLocaleDateString("en-GB")}
        </div>
      </div>
    </div>
  );
}
