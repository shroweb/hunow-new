import type { EventItem } from "@/types";
import { slugify } from "./dedupe.server";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchVisitHullEvents(limit = 25): Promise<EventItem[]> {
  const events: EventItem[] = [];
  try {
    const sitemapRes = await fetch("https://www.visithull.com/sitemap.xml", {
      headers: { "User-Agent": UA },
    });
    if (!sitemapRes.ok) return [];
    const xml = await sitemapRes.text();

    const locRegex = /<loc>(https:\/\/www\.visithull\.com\/event\/[^<]+)<\/loc>/g;
    const urls: string[] = [];
    let match;
    while ((match = locRegex.exec(xml)) !== null) {
      urls.push(match[1]);
      if (urls.length >= limit * 2) break;
    }

    // Fetch individual pages concurrently in small batches
    for (let i = 0; i < urls.length && events.length < limit; i += 5) {
      const batch = urls.slice(i, i + 5);
      const batchResults = await Promise.all(
        batch.map(async (url) => {
          try {
            const pageRes = await fetch(url, { headers: { "User-Agent": UA } });
            if (!pageRes.ok) return null;
            const html = await pageRes.text();

            const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
            if (!schemaMatch) return null;

            const data = JSON.parse(schemaMatch[1]);
            if (data["@type"] !== "Event" || !data.name || !data.startDate) return null;

            const title = String(data.name).trim();
            const startDate = String(data.startDate).slice(0, 10);
            if (new Date(startDate) < new Date(new Date().setDate(new Date().getDate() - 1))) {
              // Skip past events
              return null;
            }

            const titleLower = title.toLowerCase();
            let category = "Culture";
            if (titleLower.includes("food") || titleLower.includes("coffee") || titleLower.includes("taste")) category = "Food & Drink";
            else if (titleLower.includes("music") || titleLower.includes("disco") || titleLower.includes("rave") || titleLower.includes("concert")) category = "Music";
            else if (titleLower.includes("family") || titleLower.includes("kids") || titleLower.includes("panto")) category = "Family";
            else if (titleLower.includes("art") || titleLower.includes("exhibition") || titleLower.includes("potter")) category = "Arts";
            else if (titleLower.includes("tour") || titleLower.includes("history") || titleLower.includes("heritage")) category = "Community";

            const coords = data.location?.geo?.latitude && data.location?.geo?.longitude
              ? { lat: Number(data.location.geo.latitude), lng: Number(data.location.geo.longitude) }
              : undefined;

            const id = `visithull-${slugify(title)}-${startDate}`;
            const event: EventItem = {
              id,
              title,
              slug: slugify(`visithull-${title}-${startDate}`),
              description: data.description ? String(data.description).replace(/&nbsp;/g, " ").replace(/<[^>]+>/g, "").slice(0, 300) : `Event in Hull: ${title}`,
              category,
              area: "Old Town",
              startDate,
              startTime: "10:00",
              locationName: data.location?.name || "Hull City Centre",
              address: data.location?.address?.streetAddress || "Hull, HU1",
              coordinates: coords,
              price: "See event details",
              isFree: titleLower.includes("free") || (data.description || "").toLowerCase().includes("free admission"),
              ticketUrl: data.url || url,
              featuredImage: data.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&h=800&q=80",
              status: "published",
              isFeatured: false,
              isSponsored: false,
            };
            return event;
          } catch {
            return null;
          }
        }),
      );

      for (const ev of batchResults) {
        if (ev) events.push(ev);
      }
    }
  } catch (err) {
    console.error("Error scraping Visit Hull:", err);
  }
  return events;
}
