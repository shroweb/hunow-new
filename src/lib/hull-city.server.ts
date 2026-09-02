import type { EventItem } from "@/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

interface BbcRawMatch {
  home?: { fullName?: string; shortName?: string };
  away?: { fullName?: string; shortName?: string };
  eventGroupingLabel?: string;
  date?: { isoDate?: string; time?: string };
}

async function fetchFromBbcSport(): Promise<EventItem[]> {
  const res = await fetch("https://www.bbc.co.uk/sport/football/teams/hull-city/scores-fixtures", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`BBC Sport responded with ${res.status}`);
  const html = await res.text();
  const match = html.match(/window\.__INITIAL_DATA__\s*=\s*"([\s\S]*?)";<\/script>/);
  if (!match) throw new Error("Could not find fixture payload on BBC Sport");
  const unescaped = JSON.parse('"' + match[1] + '"');
  const data = JSON.parse(unescaped);
  const fixturesKey = Object.keys(data.data || {}).find((k) =>
    k.startsWith("sport-data-scores-fixtures"),
  );
  if (!fixturesKey) return [];
  const fixturesData = data.data[fixturesKey]?.data;

  const rawMatches: BbcRawMatch[] = [];
  for (const g of fixturesData?.eventGroups || []) {
    for (const sg of g.secondaryGroups || []) {
      for (const ev of sg.events || []) {
        rawMatches.push(ev);
      }
    }
  }

  const events: EventItem[] = [];
  for (const m of rawMatches) {
    const isHome =
      m.home?.fullName?.toLowerCase().includes("hull") ||
      m.home?.shortName?.toLowerCase().includes("hull");
    const opponent = isHome ? m.away?.fullName || "Opponent" : m.home?.fullName || "Opponent";
    const title = isHome ? `Hull City vs ${opponent}` : `${opponent} vs Hull City (Away)`;
    const startDate = m.date?.isoDate || new Date().toISOString().slice(0, 10);
    const startTime = m.date?.time || "15:00";
    const competition = m.eventGroupingLabel || "EFL Championship";

    events.push({
      id: `hullcity-${slugify(title)}-${startDate}`,
      title,
      slug: slugify(`hull-city-${isHome ? "vs" : "at"}-${opponent}-${startDate}`),
      description: `${competition}. ${
        isHome
          ? `Hull City take on ${opponent} at the MKM Stadium in Hull. Kick-off at ${startTime}.`
          : `Hull City travel to face ${opponent}. Kick-off at ${startTime}.`
      }`,
      category: "Sport",
      area: isHome ? "Anlaby Road" : undefined,
      startDate,
      startTime,
      locationName: isHome ? "MKM Stadium, Hull" : `${opponent} Stadium (Away)`,
      address: isHome ? "Walton Street, Hull, HU3 6HU" : "",
      coordinates: isHome ? { lat: 53.7461, lng: -0.3678 } : undefined,
      price: "See official ticketing",
      isFree: false,
      ticketUrl: "https://www.wearehullcity.co.uk/tickets/",
      featuredImage: isHome
        ? "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&h=800&q=80"
        : "https://upload.wikimedia.org/wikipedia/en/5/54/Hull_City_A.F.C._logo.svg",
      status: "published",
      isFeatured: isHome,
      isSponsored: false,
    });
  }
  return events;
}

async function fetchFromTheSportsDb(): Promise<EventItem[]> {
  const res = await fetch("https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=133617");
  if (!res.ok) return [];
  const data = (await res.json()) as {
    events?: Array<{
      idEvent: string;
      strEvent: string;
      strHomeTeam: string;
      strAwayTeam: string;
      dateEvent: string;
      strTime?: string;
      strVenue?: string;
      strLeague?: string;
      strThumb?: string;
    }>;
  };
  const events: EventItem[] = [];
  for (const m of data.events || []) {
    const isHome = m.strHomeTeam.toLowerCase().includes("hull");
    const opponent = isHome ? m.strAwayTeam : m.strHomeTeam;
    const title = isHome ? `Hull City vs ${opponent}` : `${opponent} vs Hull City (Away)`;
    const startDate = m.dateEvent;
    const startTime = m.strTime ? m.strTime.slice(0, 5) : "15:00";
    const competition = m.strLeague || "EFL Championship";

    events.push({
      id: `hullcity-${m.idEvent}`,
      title,
      slug: slugify(`hull-city-${isHome ? "vs" : "at"}-${opponent}-${startDate}`),
      description: `${competition}. ${
        isHome
          ? `Hull City take on ${opponent} at the MKM Stadium. Kick-off at ${startTime}.`
          : `Hull City face ${opponent}. Kick-off at ${startTime}.`
      }`,
      category: "Sport",
      area: isHome ? "Anlaby Road" : undefined,
      startDate,
      startTime,
      locationName: isHome ? "MKM Stadium, Hull" : m.strVenue || `${opponent} Stadium (Away)`,
      address: isHome ? "Walton Street, Hull, HU3 6HU" : "",
      coordinates: isHome ? { lat: 53.7461, lng: -0.3678 } : undefined,
      price: "See official ticketing",
      isFree: false,
      ticketUrl: "https://www.wearehullcity.co.uk/tickets/",
      featuredImage:
        m.strThumb ||
        "https://upload.wikimedia.org/wikipedia/en/5/54/Hull_City_A.F.C._logo.svg",
      status: "published",
      isFeatured: isHome,
      isSponsored: false,
    });
  }
  return events;
}

export async function syncHullCityFixtures(): Promise<{
  imported: number;
  skipped: number;
  fixtures: string[];
  events: EventItem[];
}> {
  let events: EventItem[] = [];

  // 1. Try BBC Sport (accurate, free, up-to-date kick-off times, no API key needed)
  try {
    events = await fetchFromBbcSport();
  } catch (err) {
    console.warn("BBC Sport fixture sync failed, falling back to TheSportsDB:", err);
  }

  // 2. Fallback to TheSportsDB if BBC returned nothing
  if (events.length === 0) {
    try {
      events = await fetchFromTheSportsDb();
    } catch (err) {
      console.warn("TheSportsDB fixture sync failed:", err);
    }
  }

  if (events.length === 0) {
    throw new Error(
      "Unable to fetch upcoming Hull City fixtures from live sports feeds. Please check connection and try again.",
    );
  }

  const { upsertEvent } = await import("@/lib/db.server");
  let imported = 0;
  let skipped = 0;
  const fixtures: string[] = [];
  const importedEvents: EventItem[] = [];

  for (const event of events) {
    try {
      await upsertEvent(event);
      imported++;
      fixtures.push(event.title);
      importedEvents.push(event);
    } catch {
      skipped++;
    }
  }

  return { imported, skipped, fixtures, events: importedEvents };
}
