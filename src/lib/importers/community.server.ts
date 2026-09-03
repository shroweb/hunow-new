import type { EventItem } from "@/types";
import { slugify } from "./dedupe.server";

// Get next N upcoming Saturdays
function getNextSaturdays(count = 6): string[] {
  const dates: string[] = [];
  const d = new Date();
  while (dates.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) {
      dates.push(d.toISOString().slice(0, 10));
    }
  }
  return dates;
}

export async function generateHullCommunityEvents(): Promise<EventItem[]> {
  const events: EventItem[] = [];
  const saturdays = getNextSaturdays(6);

  for (const date of saturdays) {
    // 1. East Park Parkrun
    events.push({
      id: `parkrun-eastpark-${date}`,
      title: "Hull Parkrun — East Park 5k",
      slug: slugify(`hull-parkrun-east-park-${date}`),
      description: "Free, fun, and friendly weekly 5k community event. Walk, jog, run, volunteer, or spectate around the scenic East Park lake. Free entry (register once with parkrun UK for a barcode).",
      category: "Sport",
      area: "East Hull",
      startDate: date,
      startTime: "09:00",
      locationName: "East Park, Hull",
      address: "Holderness Road, Hull, HU8 8JU",
      coordinates: { lat: 53.7663, lng: -0.3015 },
      price: "Free",
      isFree: true,
      ticketUrl: "https://www.parkrun.org.uk/hull/",
      featuredImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&h=800&q=80",
      status: "published",
      isFeatured: false,
      isSponsored: false,
    });

    // 2. Peter Pan Parkrun
    events.push({
      id: `parkrun-peterpan-${date}`,
      title: "Peter Pan Parkrun 5k",
      slug: slugify(`peter-pan-parkrun-${date}`),
      description: "Friendly community 5k run, jog, or walk around Peter Pan Park in West Hull. Free entry for all abilities, completely organized by local volunteers.",
      category: "Sport",
      area: "Hessle Road",
      startDate: date,
      startTime: "09:00",
      locationName: "Peter Pan Park, Hull",
      address: "Pickering Road, Hull, HU4 7AB",
      coordinates: { lat: 53.7314, lng: -0.3956 },
      price: "Free",
      isFree: true,
      ticketUrl: "https://www.parkrun.org.uk/peterpan/",
      featuredImage: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=1200&h=800&q=80",
      status: "published",
      isFeatured: false,
      isSponsored: false,
    });

    // 3. Humber Bridge Country Park Parkrun
    events.push({
      id: `parkrun-humberbridge-${date}`,
      title: "Humber Bridge Parkrun 5k",
      slug: slugify(`humber-bridge-parkrun-${date}`),
      description: "Trail-style 5k weekly parkrun winding through the chalk cliffs and woodland paths of Humber Bridge Country Park with views of the iconic suspension bridge.",
      category: "Sport",
      area: "Hull",
      startDate: date,
      startTime: "09:00",
      locationName: "Humber Bridge Country Park",
      address: "Ferriby Road, Hessle, HU13 0HB",
      coordinates: { lat: 53.7161, lng: -0.4502 },
      price: "Free",
      isFree: true,
      ticketUrl: "https://www.parkrun.org.uk/humberbridge/",
      featuredImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&h=800&q=80",
      status: "published",
      isFeatured: false,
      isSponsored: false,
    });

    // 4. Trinity Market Food & Craft Saturday
    events.push({
      id: `trinity-market-saturday-${date}`,
      title: "Trinity Market Saturday Street Food & Indie Stalls",
      slug: slugify(`trinity-market-saturday-${date}`),
      description: "Explore the bustling street food traders and independent artisan makers inside historic Trinity Market in Hull Old Town. Artisan coffee, authentic cuisines, craft beer, and baked goods.",
      category: "Food & Drink",
      area: "Old Town",
      startDate: date,
      startTime: "10:00",
      locationName: "Trinity Market, Hull Old Town",
      address: "Trinity Market, Lowgate, Hull, HU1 2JH",
      coordinates: { lat: 53.7429, lng: -0.3341 },
      price: "Free admission",
      isFree: true,
      ticketUrl: "https://www.trinitymarkethull.co.uk/",
      featuredImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=800&q=80",
      status: "published",
      isFeatured: false,
      isSponsored: false,
    });
  }

  return events;
}
