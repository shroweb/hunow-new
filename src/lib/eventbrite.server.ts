import type { EventItem } from "@/types";

const BASE = "https://www.eventbriteapi.com/v3";

function token() {
  const t = process.env.EVENTBRITE_PRIVATE_TOKEN;
  if (!t) throw new Error("EVENTBRITE_PRIVATE_TOKEN is not set");
  return t;
}

function headers() {
  return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" };
}

function slugify(text: string, id: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) +
    "-eb-" +
    id
  );
}

function mapCategory(name: string | undefined): string {
  if (!name) return "Events";
  const n = name.toLowerCase();
  if (n.includes("music")) return "Music";
  if (n.includes("food") || n.includes("drink")) return "Food & Drink";
  if (n.includes("art") || n.includes("culture")) return "Arts";
  if (n.includes("comedy") || n.includes("standup")) return "Comedy";
  if (n.includes("family") || n.includes("kid") || n.includes("child")) return "Family";
  if (n.includes("theatre") || n.includes("theater")) return "Theatre";
  if (n.includes("night") || n.includes("club") || n.includes("dance")) return "Nightlife";
  if (n.includes("sport") || n.includes("fitness")) return "Sport";
  if (n.includes("business") || n.includes("network")) return "Business";
  return "Events";
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}

function formatPrice(eb: EbEvent): { price: string; isFree: boolean } {
  if (eb.is_free) return { price: "Free", isFree: true };
  const ticket = eb.ticket_availability;
  if (ticket?.minimum_ticket_price) {
    const amt = Number(ticket.minimum_ticket_price.major_value ?? 0);
    const max = Number(ticket.maximum_ticket_price?.major_value ?? 0);
    if (max && max !== amt) return { price: `£${amt}–£${max}`, isFree: false };
    return { price: `From £${amt}`, isFree: false };
  }
  return { price: "See ticket page", isFree: false };
}

interface EbEvent {
  id: string;
  name: { text: string };
  description?: { text?: string };
  start: { utc: string; local: string };
  end: { utc: string; local: string };
  url: string;
  is_free: boolean;
  logo?: { url?: string; original?: { url?: string } };
  category?: { name?: string };
  venue?: {
    name?: string;
    address?: { localized_address_display?: string };
  };
  ticket_availability?: {
    minimum_ticket_price?: { major_value?: string };
    maximum_ticket_price?: { major_value?: string };
  };
}

interface EbPage {
  events: EbEvent[];
  pagination: { has_more_items: boolean; continuation?: string };
}

async function fetchPage(url: string): Promise<EbPage> {
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Eventbrite API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<EbPage>;
}

async function fetchAllEvents(locationQuery: string): Promise<EbEvent[]> {
  const events: EbEvent[] = [];
  let url =
    `${BASE}/events/search/?` +
    new URLSearchParams({
      "location.address": locationQuery,
      "location.within": "15km",
      "start_date.range_start": new Date().toISOString().slice(0, 19) + "Z",
      status: "live",
      expand: "venue,category,ticket_availability",
      page_size: "50",
    });

  let hasMore = true;
  while (hasMore) {
    const page = await fetchPage(url);
    events.push(...page.events);
    hasMore = page.pagination.has_more_items;
    if (hasMore && page.pagination.continuation) {
      url =
        `${BASE}/events/search/?` +
        new URLSearchParams({
          "location.address": locationQuery,
          "location.within": "15km",
          status: "live",
          expand: "venue,category,ticket_availability",
          page_size: "50",
          continuation: page.pagination.continuation,
        });
    } else {
      hasMore = false;
    }
  }
  return events;
}

export function mapEventbriteEvent(eb: EbEvent): EventItem {
  const { price, isFree } = formatPrice(eb);
  const startDate = eb.start.utc.slice(0, 10);
  const endDate = eb.end.utc.slice(0, 10);

  return {
    id: `eventbrite-${eb.id}`,
    title: eb.name.text,
    slug: slugify(eb.name.text, eb.id),
    description: eb.description?.text?.slice(0, 500) ?? "",
    category: mapCategory(eb.category?.name),
    startDate,
    endDate: endDate !== startDate ? endDate : undefined,
    startTime: formatTime(eb.start.local),
    endTime: formatTime(eb.end.local),
    locationName: eb.venue?.name ?? "Hull",
    address: eb.venue?.address?.localized_address_display ?? "Hull, UK",
    price,
    isFree,
    ticketUrl: eb.url,
    featuredImage: eb.logo?.original?.url ?? eb.logo?.url ?? "",
    status: "published",
    isFeatured: false,
    isSponsored: false,
  };
}

export async function syncEventbriteEvents(locationQuery = "Hull, UK"): Promise<{
  synced: number;
  skipped: number;
}> {
  const { upsertEvent, getPool, ensureSchema } = await import("@/lib/db.server");
  await ensureSchema();

  const ebEvents = await fetchAllEvents(locationQuery);

  // Load existing Eventbrite IDs so we can skip unchanged events
  const existing = await getPool().query<{ id: string }>(
    "select id from events where id like 'eventbrite-%'",
  );
  const existingIds = new Set(existing.rows.map((r) => r.id));

  let synced = 0;
  let skipped = 0;

  for (const eb of ebEvents) {
    const mapped = mapEventbriteEvent(eb);
    // Always upsert — title/price/venue can change on Eventbrite
    await upsertEvent(mapped);
    if (existingIds.has(mapped.id)) {
      skipped++;
    } else {
      synced++;
    }
  }

  return { synced, skipped };
}
