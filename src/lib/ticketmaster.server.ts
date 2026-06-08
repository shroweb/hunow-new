import type { EventItem } from "@/types";

const BASE = "https://app.ticketmaster.com/discovery/v2";

function apiKey() {
  const k = process.env.TICKETMASTER_API_KEY;
  if (!k) throw new Error("TICKETMASTER_API_KEY is not set");
  return k;
}

export function extractTicketmasterId(input: string): string | null {
  // https://www.ticketmaster.co.uk/event/1F00596C47E53344
  // https://www.ticketmaster.com/event/1F00596C47E53344
  const fromUrl = input.match(/\/event\/([A-Za-z0-9]+)/i);
  if (fromUrl) return fromUrl[1];
  if (/^[A-Za-z0-9]{10,}$/.test(input.trim())) return input.trim();
  return null;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function mapCategory(segment: string | undefined, genre: string | undefined): string {
  const s = (segment ?? "").toLowerCase();
  const g = (genre ?? "").toLowerCase();
  if (s === "music") {
    if (g.includes("comedy")) return "Comedy";
    return "Music";
  }
  if (s === "arts & theatre") {
    if (g.includes("comedy")) return "Comedy";
    if (g.includes("theatre") || g.includes("theater")) return "Theatre";
    return "Arts";
  }
  if (s === "sports") return "Events";
  if (g.includes("family") || g.includes("kid")) return "Family";
  return "Events";
}

function bestImage(images: Array<{ url: string; width?: number; height?: number }>): string {
  if (!images?.length) return "";
  const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return sorted[0].url;
}

interface TmVenue {
  name?: string;
  address?: { line1?: string };
  city?: { name?: string };
  postalCode?: string;
}

interface TmEvent {
  id: string;
  name: string;
  url: string;
  images?: Array<{ url: string; width?: number; height?: number }>;
  dates?: {
    start?: { localDate?: string; localTime?: string };
    end?: { localDate?: string; localTime?: string };
  };
  classifications?: Array<{
    segment?: { name?: string };
    genre?: { name?: string };
  }>;
  priceRanges?: Array<{ min?: number; max?: number; currency?: string }>;
  info?: string;
  pleaseNote?: string;
  _embedded?: { venues?: TmVenue[] };
}

function mapTicketmasterEvent(ev: TmEvent): EventItem {
  const venue = ev._embedded?.venues?.[0];
  const cls = ev.classifications?.[0];
  const category = mapCategory(cls?.segment?.name, cls?.genre?.name);
  const startDate = ev.dates?.start?.localDate ?? new Date().toISOString().slice(0, 10);
  const endDate = ev.dates?.end?.localDate;
  const startTime = ev.dates?.start?.localTime?.slice(0, 5) ?? "";
  const endTime = ev.dates?.end?.localTime?.slice(0, 5) ?? "";

  let price = "See ticket page";
  let isFree = false;
  if (ev.priceRanges?.length) {
    const pr = ev.priceRanges[0];
    const min = pr.min ?? 0;
    const max = pr.max ?? 0;
    if (min === 0 && max === 0) {
      price = "Free";
      isFree = true;
    } else if (min === max || !max) {
      price = `From £${min.toFixed(0)}`;
    } else {
      price = `£${min.toFixed(0)}–£${max.toFixed(0)}`;
    }
  }

  const addressParts = [venue?.address?.line1, venue?.city?.name, venue?.postalCode].filter(
    Boolean,
  );

  return {
    id: `ticketmaster-${ev.id}`,
    title: ev.name,
    slug: slugify(ev.name),
    description: ev.info ?? ev.pleaseNote ?? "",
    category,
    startDate,
    endDate: endDate && endDate !== startDate ? endDate : undefined,
    startTime,
    endTime: endTime || undefined,
    locationName: venue?.name ?? "Hull",
    address: addressParts.join(", ") || "Hull, UK",
    price,
    isFree,
    ticketUrl: ev.url,
    featuredImage: bestImage(ev.images ?? []),
    status: "published",
    isFeatured: false,
    isSponsored: false,
  };
}

export async function importTicketmasterUrl(urlOrId: string): Promise<EventItem> {
  const id = extractTicketmasterId(urlOrId);
  if (!id) throw new Error("Could not extract a Ticketmaster event ID from that URL");

  const res = await fetch(`${BASE}/events/${id}.json?apikey=${apiKey()}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ticketmaster API error ${res.status}: ${body}`);
  }

  const ev = (await res.json()) as TmEvent;
  const event = mapTicketmasterEvent(ev);

  const { upsertEvent } = await import("@/lib/db.server");
  await upsertEvent(event);
  return event;
}
