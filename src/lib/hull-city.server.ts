import type { EventItem } from "@/types";

const BASE = "https://api.football-data.org/v4";
const HULL_CITY_ID = 322; // football-data.org team ID for Hull City AFC

function authHeaders(): Record<string, string> {
  const key = process.env.FOOTBALL_DATA_API_KEY ?? "";
  return key ? { "X-Auth-Token": key } : {};
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  venue?: string;
  homeTeam: { name: string; crest?: string };
  awayTeam: { name: string; crest?: string };
  competition: { name: string };
  score?: { fullTime?: { home?: number | null; away?: number | null } };
}

function mapMatch(match: FdMatch): EventItem {
  const date = new Date(match.utcDate);
  const startDate = date.toISOString().slice(0, 10);
  const startTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  });

  const isHome = match.homeTeam.name.toLowerCase().includes("hull");
  const opponent = isHome ? match.awayTeam.name : match.homeTeam.name;
  const title = isHome
    ? `Hull City vs ${opponent}`
    : `${opponent} vs Hull City`;

  const venue = match.venue ?? (isHome ? "MKM Stadium, Hull" : `${opponent} Ground`);
  const address = isHome ? "Walton Street, Hull, HU3 6HU" : "";

  return {
    id: `hullcity-${match.id}`,
    title,
    slug: slugify(`hull-city-${isHome ? "vs" : "at"}-${opponent}-${startDate}`),
    description: `${match.competition.name} — ${isHome ? "Home" : "Away"} fixture.`,
    category: "Sport",
    startDate,
    startTime,
    locationName: venue,
    address,
    price: "See ticketing",
    isFree: false,
    ticketUrl: "https://www.hullcitytigers.com/tickets/",
    featuredImage: "https://upload.wikimedia.org/wikipedia/en/5/54/Hull_City_A.F.C._logo.svg",
    status: "published",
    isFeatured: false,
    isSponsored: false,
  };
}

export async function syncHullCityFixtures(): Promise<{ imported: number; skipped: number }> {
  const res = await fetch(
    `${BASE}/teams/${HULL_CITY_ID}/matches?status=SCHEDULED&limit=20`,
    { headers: authHeaders() },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`football-data.org API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { matches?: FdMatch[] };
  const matches = data.matches ?? [];

  const { upsertEvent } = await import("@/lib/db.server");
  let imported = 0;
  let skipped = 0;

  for (const match of matches) {
    try {
      const event = mapMatch(match);
      await upsertEvent(event);
      imported++;
    } catch {
      skipped++;
    }
  }

  return { imported, skipped };
}
