import type { EventItem } from "@/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const UA_HEADER = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function extractBbcFixturesFromHtml(html: string): any[] {
  const match = html.match(/window\.__INITIAL_DATA__\s*=\s*"([\s\S]*?)";<\/script>/);
  if (!match) return [];
  try {
    const unescaped = JSON.parse('"' + match[1] + '"');
    const data = JSON.parse(unescaped);
    const key = Object.keys(data.data || {}).find((k) =>
      k.startsWith("sport-data-scores-fixtures"),
    );
    if (!key) return [];
    const fixturesData = data.data[key]?.data;
    const rawMatches: any[] = [];
    for (const g of fixturesData?.eventGroups || []) {
      for (const sg of g.secondaryGroups || []) {
        for (const ev of sg.events || []) {
          rawMatches.push(ev);
        }
      }
    }
    return rawMatches;
  } catch {
    return [];
  }
}

// 1. Hull City AFC Full Season
export async function fetchHullCityFixtures(): Promise<EventItem[]> {
  const months = [
    "2026-09",
    "2026-10",
    "2026-11",
    "2026-12",
    "2027-01",
    "2027-02",
    "2027-03",
    "2027-04",
    "2027-05",
  ];
  const seen = new Set<string>();
  const events: EventItem[] = [];

  for (const m of months) {
    try {
      const url = `https://www.bbc.co.uk/sport/football/teams/hull-city/scores-fixtures/${m}`;
      const res = await fetch(url, { headers: UA_HEADER });
      if (!res.ok) continue;
      const html = await res.text();
      const rawMatches = extractBbcFixturesFromHtml(html);

      for (const raw of rawMatches) {
        const homeName = raw.home?.fullName || raw.home?.shortName || "";
        const awayName = raw.away?.fullName || raw.away?.shortName || "";
        const isHome =
          homeName.toLowerCase().includes("hull") || raw.home?.urn?.includes("hull-city");
        const opponent = isHome ? awayName || "Opponent" : homeName || "Opponent";
        const title = isHome ? `Hull City vs ${opponent}` : `${opponent} vs Hull City (Away)`;
        const startDate = raw.date?.isoDate || (raw.startDateTime ? raw.startDateTime.slice(0, 10) : "");
        if (!startDate) continue;
        const dedupeKey = `hullcity-${slugify(title)}-${startDate}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const startTime = raw.date?.time || "15:00";
        const competition = raw.eventGroupingLabel || raw.tournament?.name || "EFL Championship";

        events.push({
          id: dedupeKey,
          title,
          slug: slugify(`hull-city-${isHome ? "vs" : "at"}-${opponent}-${startDate}`),
          description: `${competition}. ${
            isHome
              ? `Hull City host ${opponent} at the MKM Stadium in Hull. Kick-off at ${startTime}.`
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
            ? "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&h=800&q=80"
            : "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&h=800&q=80",
          status: "published",
          isFeatured: isHome,
          isSponsored: false,
        });
      }
    } catch (err) {
      console.warn(`Error fetching Hull City fixtures for ${m}:`, err);
    }
  }

  return events;
}

// 2. Hull KR (Hull Kingston Rovers - Rugby League)
export async function fetchHullKrFixtures(): Promise<EventItem[]> {
  const months = ["2026-09", "2026-10", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09"];
  const seen = new Set<string>();
  const events: EventItem[] = [];

  for (const m of months) {
    try {
      const url = `https://www.bbc.co.uk/sport/rugby-league/super-league/scores-fixtures/${m}`;
      const res = await fetch(url, { headers: UA_HEADER });
      if (!res.ok) continue;
      const html = await res.text();
      const rawMatches = extractBbcFixturesFromHtml(html);

      for (const raw of rawMatches) {
        const homeName = raw.home?.fullName || "";
        const awayName = raw.away?.fullName || "";
        const isKrHome = homeName.toLowerCase().includes("kingston") || homeName.toLowerCase().includes("hull kr");
        const isKrAway = awayName.toLowerCase().includes("kingston") || awayName.toLowerCase().includes("hull kr");
        if (!isKrHome && !isKrAway) continue;

        const isHome = isKrHome;
        const opponent = isHome ? awayName : homeName;
        const title = isHome ? `Hull KR vs ${opponent}` : `${opponent} vs Hull KR (Away)`;
        const startDate = raw.date?.isoDate || (raw.startDateTime ? raw.startDateTime.slice(0, 10) : "");
        if (!startDate) continue;
        const dedupeKey = `hullkr-${slugify(title)}-${startDate}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        let startTime = "20:00";
        if (raw.startDateTime) {
          const d = new Date(raw.startDateTime);
          startTime = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
        } else if (raw.date?.time) {
          startTime = raw.date.time;
        }

        const competition = raw.tournament?.name || raw.eventGroupingLabel || "Betfred Super League";

        events.push({
          id: dedupeKey,
          title,
          slug: slugify(`hull-kr-${isHome ? "vs" : "at"}-${opponent}-${startDate}`),
          description: `${competition}. ${
            isHome
              ? `Hull Kingston Rovers host ${opponent} under the lights at Sewell Group Craven Park in East Hull. Kick-off at ${startTime}.`
              : `Hull Kingston Rovers travel to face ${opponent}. Kick-off at ${startTime}.`
          }`,
          category: "Sport",
          area: isHome ? "East Hull" : undefined,
          startDate,
          startTime,
          locationName: isHome ? "Sewell Group Craven Park, Hull" : `${opponent} Ground (Away)`,
          address: isHome ? "Preston Road, Hull, HU9 5HE" : "",
          coordinates: isHome ? { lat: 53.7533, lng: -0.2797 } : undefined,
          price: "See official ticketing",
          isFree: false,
          ticketUrl: "https://hullkr.co.uk/tickets/",
          featuredImage: isHome
            ? "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=800&q=80"
            : "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&h=800&q=80",
          status: "published",
          isFeatured: isHome,
          isSponsored: false,
        });
      }
    } catch (err) {
      console.warn(`Error fetching Hull KR fixtures for ${m}:`, err);
    }
  }

  return events;
}

// 3. Hull FC ("KC Stadium" / Rugby League)
export async function fetchHullFcFixtures(): Promise<EventItem[]> {
  const months = ["2026-09", "2026-10", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09"];
  const seen = new Set<string>();
  const events: EventItem[] = [];

  for (const m of months) {
    try {
      const url = `https://www.bbc.co.uk/sport/rugby-league/super-league/scores-fixtures/${m}`;
      const res = await fetch(url, { headers: UA_HEADER });
      if (!res.ok) continue;
      const html = await res.text();
      const rawMatches = extractBbcFixturesFromHtml(html);

      for (const raw of rawMatches) {
        const homeName = raw.home?.fullName || "";
        const awayName = raw.away?.fullName || "";
        // Match Hull FC (and not Kingston)
        const isFcHome = (homeName === "Hull FC" || homeName === "Hull") && !homeName.toLowerCase().includes("kingston");
        const isFcAway = (awayName === "Hull FC" || awayName === "Hull") && !awayName.toLowerCase().includes("kingston");
        if (!isFcHome && !isFcAway) continue;

        const isHome = isFcHome;
        const opponent = isHome ? awayName : homeName;
        const title = isHome ? `Hull FC vs ${opponent}` : `${opponent} vs Hull FC (Away)`;
        const startDate = raw.date?.isoDate || (raw.startDateTime ? raw.startDateTime.slice(0, 10) : "");
        if (!startDate) continue;
        const dedupeKey = `hullfc-${slugify(title)}-${startDate}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        let startTime = "20:00";
        if (raw.startDateTime) {
          const d = new Date(raw.startDateTime);
          startTime = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
        } else if (raw.date?.time) {
          startTime = raw.date.time;
        }

        const competition = raw.tournament?.name || raw.eventGroupingLabel || "Betfred Super League";

        events.push({
          id: dedupeKey,
          title,
          slug: slugify(`hull-fc-${isHome ? "vs" : "at"}-${opponent}-${startDate}`),
          description: `${competition}. ${
            isHome
              ? `Hull FC take on ${opponent} at the MKM Stadium (KC Stadium) in Hull. Kick-off at ${startTime}.`
              : `Hull FC travel to face ${opponent}. Kick-off at ${startTime}.`
          }`,
          category: "Sport",
          area: isHome ? "Anlaby Road" : undefined,
          startDate,
          startTime,
          locationName: isHome ? "MKM Stadium (KC Stadium), Hull" : `${opponent} Ground (Away)`,
          address: isHome ? "Walton Street, Hull, HU3 6HU" : "",
          coordinates: isHome ? { lat: 53.7461, lng: -0.3678 } : undefined,
          price: "See official ticketing",
          isFree: false,
          ticketUrl: "https://hullfc.com/tickets/",
          featuredImage: isHome
            ? "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&h=800&q=80"
            : "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=800&q=80",
          status: "published",
          isFeatured: isHome,
          isSponsored: false,
        });
      }
    } catch (err) {
      console.warn(`Error fetching Hull FC fixtures for ${m}:`, err);
    }
  }

  return events;
}

export async function syncHullSportsFixtures(
  target: "hull-city" | "hull-kr" | "hull-fc" | "all" = "all",
): Promise<{
  imported: number;
  skipped: number;
  fixtures: string[];
  events: EventItem[];
}> {
  let pendingEvents: EventItem[] = [];

  if (target === "hull-city" || target === "all") {
    const cityEvents = await fetchHullCityFixtures();
    pendingEvents.push(...cityEvents);
  }

  if (target === "hull-kr" || target === "all") {
    const krEvents = await fetchHullKrFixtures();
    pendingEvents.push(...krEvents);
  }

  if (target === "hull-fc" || target === "all") {
    const fcEvents = await fetchHullFcFixtures();
    pendingEvents.push(...fcEvents);
  }

  if (pendingEvents.length === 0) {
    throw new Error(
      "No upcoming fixtures found across live sport feeds. Please verify connection and try again.",
    );
  }

  const { upsertEvent } = await import("@/lib/db.server");
  let imported = 0;
  let skipped = 0;
  const fixtures: string[] = [];
  const importedEvents: EventItem[] = [];

  for (const event of pendingEvents) {
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

// Backwards compatibility alias
export async function syncHullCityFixtures() {
  return syncHullSportsFixtures("all");
}

