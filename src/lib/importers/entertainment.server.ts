import type { EventItem } from "@/types";
import { slugify } from "./dedupe.server";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function parseMonth(mon: string): string {
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    january: "01", february: "02", march: "03", april: "04", june: "06",
    july: "07", august: "08", september: "09", october: "10", november: "11", december: "12"
  };
  return months[mon.toLowerCase()] || "01";
}

function parseHumanDate(dateStr: string): string {
  const yearMatch = dateStr.match(/\b(202[5-9])\b/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

  const monthMatch = dateStr.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
  if (!monthMatch) return "";
  const month = parseMonth(monthMatch[1]);

  const dayMatch = dateStr.match(/\b([1-9]|[12][0-9]|3[01])\b/);
  const day = dayMatch ? dayMatch[1].padStart(2, "0") : "01";

  return `${year}-${month}-${day}`;
}

// "1 Sep - 5 Sep 2026" -> "2026-09-01"
function parseRangeDate(dateStr: string): string {
  const clean = dateStr.trim();
  const yearMatch = clean.match(/\b(202[5-9])\b/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

  const parts = clean.split("-")[0].trim().split(/\s+/);
  if (parts.length >= 2) {
    const day = parts[0].padStart(2, "0");
    const month = parseMonth(parts[1]);
    return `${year}-${month}-${day}`;
  }
  return "";
}

export async function fetchConnexinLiveEvents(): Promise<EventItem[]> {
  const events: EventItem[] = [];
  try {
    const res = await fetch("https://connexinlivehull.com/whats-on/", {
      headers: { "User-Agent": UA },
    });
    if (!res.ok) return [];
    const html = await res.text();

    const regex = /<a href="(\/whats-on\/[^"]+)" class="event">[\s\S]*?data-original="([^"]+)"[\s\S]*?<div class="event-name">\s*<p>\s*([\s\S]*?)<\/p>\s*<span class="date">\s*([\s\S]*?)<\/span>/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const rawUrl = match[1];
      const rawImg = match[2];
      const rawTitle = match[3].replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").trim();
      const rawDate = match[4].trim();

      const startDate = parseHumanDate(rawDate);
      if (!startDate) continue;

      const titleLower = rawTitle.toLowerCase();
      let category = "Music";
      if (titleLower.includes("comedy") || titleLower.includes("ramsey") || titleLower.includes("kay")) {
        category = "Comedy";
      } else if (titleLower.includes("boxing") || titleLower.includes("snooker") || titleLower.includes("darts")) {
        category = "Sport";
      } else if (titleLower.includes("cbeebies") || titleLower.includes("show") || titleLower.includes("party")) {
        category = "Family";
      }

      const id = `connexin-${slugify(rawTitle)}-${startDate}`;
      events.push({
        id,
        title: rawTitle,
        slug: slugify(`connexin-${rawTitle}-${startDate}`),
        description: `Live show at Connexin Live, Hull's premier entertainment arena. Featuring ${rawTitle}.`,
        category,
        area: "City Centre",
        startDate,
        startTime: "19:00",
        locationName: "Connexin Live Hull",
        address: "Myton Street, Hull, HU1 2PS",
        coordinates: { lat: 53.7423, lng: -0.3421 },
        price: "See official ticketing",
        isFree: false,
        ticketUrl: `https://connexinlivehull.com${rawUrl}`,
        featuredImage: `https://connexinlivehull.com${rawImg}`,
        status: "published",
        isFeatured: true,
        isSponsored: false,
      });
    }
  } catch (err) {
    console.error("Error scraping Connexin Live:", err);
  }
  return events;
}

export async function fetchHullTheatresEvents(): Promise<EventItem[]> {
  const events: EventItem[] = [];
  try {
    const res = await fetch("https://www.hulltheatres.co.uk/events", {
      headers: { "User-Agent": UA },
    });
    if (!res.ok) return [];
    const html = await res.text();

    const cardRegex = /<div class="uk-card-media-top">[\s\S]*?<a href="([^"]+)" title="([^"]+)">[\s\S]*?<img [^>]*src="([^"]+)"[\s\S]*?<div class="uk-position-top-left[^"]*">\s*([\s\S]*?)\s*<\/div>[\s\S]*?<span class="[^"]*uk-badge[^"]*">([\s\S]*?)<\/span>/g;
    let match;

    while ((match = cardRegex.exec(html)) !== null) {
      const rawUrl = match[1];
      const rawTitle = match[2].replace(/&amp;/g, "&").trim();
      const rawImg = match[3];
      const rawDateStr = match[4].trim();
      const venueBadge = match[5].replace(/&amp;/g, "&").trim() || "Hull New Theatre";

      const startDate = parseRangeDate(rawDateStr);
      if (!startDate) continue;

      const isCityHall = venueBadge.toLowerCase().includes("city hall");
      const venueName = isCityHall ? "Hull City Hall" : "Hull New Theatre";
      const venueAddress = isCityHall
        ? "Queen Victoria Square, Carr Lane, Hull, HU1 3RQ"
        : "Kingston Square, Hull, HU1 3HF";
      const venueCoords = isCityHall
        ? { lat: 53.7437, lng: -0.3392 }
        : { lat: 53.7472, lng: -0.3398 };

      const titleLower = rawTitle.toLowerCase();
      let category = "Theatre";
      if (titleLower.includes("comedy") || titleLower.includes("lol")) category = "Comedy";
      else if (titleLower.includes("organ") || titleLower.includes("orchestra") || titleLower.includes("concert")) category = "Music";

      const id = `hulltheatres-${slugify(rawTitle)}-${startDate}`;
      events.push({
        id,
        title: rawTitle,
        slug: slugify(`${venueName}-${rawTitle}-${startDate}`),
        description: `Experience ${rawTitle} live on stage at ${venueName}. Performance dates: ${rawDateStr}.`,
        category,
        area: "City Centre",
        startDate,
        startTime: "19:30",
        locationName: venueName,
        address: venueAddress,
        coordinates: venueCoords,
        price: "See official ticketing",
        isFree: false,
        ticketUrl: rawUrl.startsWith("http") ? rawUrl : `https://www.hulltheatres.co.uk${rawUrl}`,
        featuredImage: rawImg,
        status: "published",
        isFeatured: true,
        isSponsored: false,
      });
    }
  } catch (err) {
    console.error("Error scraping Hull Theatres:", err);
  }
  return events;
}
