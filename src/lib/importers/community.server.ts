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
      description: "Join hundreds of local runners, joggers, walkers, and spectators for Hull's free weekly 5k community event in the picturesque surroundings of East Park.\n\nThe route takes in two and a half scenic laps around the historic park's boating lake, tree-lined avenues, and heritage gardens on smooth tarmac pathways. Welcoming to participants of all paces — from complete beginners and parents with buggies to seasoned club athletes.\n\nBefore your first run, register for free with parkrun UK to receive your personal barcode. A friendly first-timers briefing begins at 8:50 AM by the main pavilion, with the run setting off promptly at 9:00 AM. Many participants head to the East Park cafe afterwards for post-run coffee, breakfast, and catch-ups.",
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
      description: "A friendly community 5k run, jog, or walk around Peter Pan Park in West Hull, completely organized by local volunteers.\n\nThe three-lap flat grass and tarmac course winds past the park's open fields, bowling greens, and play areas. It is renowned across East Yorkshire for its warm, supportive community spirit and encouraging marshals.\n\nFree entry for all ages and abilities. Register once at parkrun.org.uk for your timing barcode. Meet at the Pickering Road entrance near the Costello Stadium sports complex for the 8:50 AM briefing before the 9:00 AM start.",
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
      description: "A stunning trail-style 5k weekly parkrun winding through the chalk cliffs, meadows, and woodland paths of Humber Bridge Country Park with breathtaking views of the iconic Humber suspension bridge.\n\nThe course features an undulating trail loop known locally as Little Switzerland, offering a rewarding mix of compact gravel, tree-canopied trails, and gentle inclines. Trail shoes are recommended during wetter months.\n\nFree entry for all abilities. Meet at the meadow area near the Hessle Foreshore car park for the 8:50 AM briefing. Parking is available at the main country park car park off Ferriby Road, with post-run refreshments available at the nearby Foreshore cafes.",
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
      description: "Step inside the vibrant, historic Trinity Market in the heart of Hull Old Town for a feast of global street food, specialty coffee, and unique independent maker stalls.\n\nHoused in a beautifully restored Victorian market hall adjacent to Hull Minster, Saturday is the market's liveliest day. Wander between artisan food traders serving freshly prepared dishes from around the world — from authentic wood-fired pizza and Greek gyros to steaming bao buns, traditional Yorkshire pastries, artisan desserts, and locally roasted coffee.\n\nAlongside the food hall, browse an eclectic mix of independent stalls featuring handcrafted gifts, vintage goods, vinyl, fashion, and local produce. Plenty of communal seating makes it the perfect social hub to meet friends, enjoy lunch, or grab a craft beer before exploring the cobblestone streets of Old Town.",
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
