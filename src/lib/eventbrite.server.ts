import type { EventItem } from "@/types";

const BASE = "https://www.eventbriteapi.com/v3";

function token() {
  const t = process.env.EVENTBRITE_PRIVATE_TOKEN;
  if (!t) throw new Error("EVENTBRITE_PRIVATE_TOKEN is not set");
  return t;
}

function authHeaders() {
  return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" };
}

export function extractEventbriteId(input: string): string | null {
  // Handles URLs like:
  //   https://www.eventbrite.com/e/event-name-tickets-123456789
  //   https://www.eventbrite.co.uk/e/event-name-tickets-123456789
  //   123456789 (bare ID)
  const fromUrl = input.match(/[/-](\d{8,})\/?(?:\?|$)/);
  if (fromUrl) return fromUrl[1];
  if (/^\d{8,}$/.test(input.trim())) return input.trim();
  return null;
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

interface EbTicketClass {
  free: boolean;
  cost?: { major_value?: string };
}

interface EbEvent {
  id: string;
  name: { text: string };
  summary?: string;
  description?: { text?: string; html?: string };
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
  ticket_classes?: EbTicketClass[];
}

function formatPrice(eb: EbEvent): { price: string; isFree: boolean } {
  if (eb.is_free) return { price: "Free", isFree: true };
  const paid = eb.ticket_classes?.filter((t) => !t.free) ?? [];
  const prices = paid
    .map((t) => Number(t.cost?.major_value ?? 0))
    .filter((p) => p > 0)
    .sort((a, b) => a - b);
  if (prices.length === 0) return { price: "See ticket page", isFree: false };
  if (prices.length === 1 || prices[0] === prices[prices.length - 1]) {
    return { price: `From £${prices[0]}`, isFree: false };
  }
  return { price: `£${prices[0]}–£${prices[prices.length - 1]}`, isFree: false };
}

export function mapEventbriteEvent(eb: EbEvent): EventItem {
  const { price, isFree } = formatPrice(eb);
  const startDate = eb.start.utc.slice(0, 10);
  const endDate = eb.end.utc.slice(0, 10);

  return {
    id: `eventbrite-${eb.id}`,
    title: eb.name.text,
    slug: slugify(eb.name.text, eb.id),
    description: eb.summary ?? eb.description?.text?.slice(0, 300) ?? "",
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

async function fetchStructuredContent(id: string): Promise<string | undefined> {
  const res = await fetch(
    `${BASE}/events/${id}/structured_content/?purpose=listing`,
    { headers: authHeaders() },
  );
  if (!res.ok) return undefined;
  const data = (await res.json()) as {
    modules?: Array<{ type: string; data?: { body?: { text?: string } } }>;
  };
  const html = (data.modules ?? [])
    .filter((m) => m.type === "text" && m.data?.body?.text)
    .map((m) => m.data!.body!.text!)
    .join("\n");
  return html || undefined;
}

export async function importEventbriteUrl(urlOrId: string): Promise<EventItem> {
  const id = extractEventbriteId(urlOrId);
  if (!id) throw new Error("Could not extract an Eventbrite event ID from that URL");

  const [eventRes, structuredContent] = await Promise.all([
    fetch(`${BASE}/events/${id}/?expand=venue,category,ticket_classes`, { headers: authHeaders() }),
    fetchStructuredContent(id),
  ]);

  if (!eventRes.ok) {
    const body = await eventRes.text();
    throw new Error(`Eventbrite API error ${eventRes.status}: ${body}`);
  }

  const eb = (await eventRes.json()) as EbEvent;
  const event = { ...mapEventbriteEvent(eb), content: structuredContent };

  const { upsertEvent } = await import("@/lib/db.server");
  await upsertEvent(event);

  return event;
}
