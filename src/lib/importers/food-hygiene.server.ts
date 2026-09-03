import type { Listing } from "@/types";
import { slugify } from "./dedupe.server";

const FSA_API = "https://api.ratings.food.gov.uk";
const HULL_AUTHORITY_ID = 405;

function mapPostcodeToArea(postcode = "", address = ""): string {
  const norm = (address + " " + postcode).toLowerCase();
  if (norm.includes("humber street") || norm.includes("marina") || norm.includes("fruit market")) {
    return "Fruit Market / Marina";
  }
  if (norm.includes("princes avenue") || norm.includes("newland avenue") || norm.includes("hu5")) {
    return "The Avenues";
  }
  if (norm.includes("whitefriargate") || norm.includes("lowgate") || norm.includes("old town") || norm.includes("high street")) {
    return "Old Town";
  }
  if (norm.includes("hu1") || norm.includes("hu2")) {
    return "City Centre";
  }
  if (norm.includes("hu3") || norm.includes("anlaby")) {
    return "Anlaby Road";
  }
  if (norm.includes("hu4") || norm.includes("hessle")) {
    return "Hessle Road";
  }
  if (norm.includes("hu8") || norm.includes("hu9")) {
    return "East Hull";
  }
  return "Hull";
}

function mapBusinessTypeToCategory(type = "", name = ""): string {
  const norm = (type + " " + name).toLowerCase();
  if (norm.includes("pub") || norm.includes("bar") || norm.includes("inn") || norm.includes("arms") || norm.includes("tavern") || norm.includes("brew")) {
    return "Bars & Pubs";
  }
  if (norm.includes("cafe") || norm.includes("coffee") || norm.includes("bakery") || norm.includes("bake") || norm.includes("tearoom")) {
    return "Cafes";
  }
  return "Restaurants";
}

const PUB_IMAGES = [
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1538488881522-4328fb77821c?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1575444758702-4a6b9222336e?auto=format&fit=crop&w=1200&h=800&q=80",
];

const CAFE_IMAGES = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&h=800&q=80",
];

const RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&h=800&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&h=800&q=80",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getFoodImage(category: string, seed = ""): string {
  const hash = hashString(seed || category);
  if (category === "Bars & Pubs") {
    return PUB_IMAGES[hash % PUB_IMAGES.length];
  }
  if (category === "Cafes") {
    return CAFE_IMAGES[hash % CAFE_IMAGES.length];
  }
  return RESTAURANT_IMAGES[hash % RESTAURANT_IMAGES.length];
}

const NON_FOOD_TERMS = [
  "play town", "play centre", "soft play", "nursery", "school", "academy", "care home",
  "residential", "hospital", "medical", "prison", "canteen", "ltd c/o", "sports centre", "active+",
];

export async function fetchHullFoodEstablishments(pageSize = 40, pageNumber = 1): Promise<Listing[]> {
  const listings: Listing[] = [];
  try {
    const url = `${FSA_API}/Establishments?localAuthorityId=${HULL_AUTHORITY_ID}&pageSize=${pageSize}&pageNumber=${pageNumber}`;
    const res = await fetch(url, {
      headers: {
        "x-api-version": "2",
        "Accept": "application/json",
      },
    });

    if (!res.ok) return [];
    const json = await res.json();
    const items = json.establishments || [];

    for (const est of items) {
      const type = est.BusinessType || "";
      const validTypes = ["Restaurant/Cafe/Canteen", "Pub/bar/nightclub", "Takeaway/sandwich shop"];
      if (!validTypes.includes(type)) continue;

      const name = (est.BusinessName || "").trim();
      if (!name || name.length < 2) continue;

      const normName = name.toLowerCase();
      if (NON_FOOD_TERMS.some((term) => normName.includes(term))) continue;

      const addressParts = [
        est.AddressLine1,
        est.AddressLine2,
        est.AddressLine3,
        est.PostCode,
      ].filter(Boolean);
      const fullAddress = addressParts.join(", ");
      const area = mapPostcodeToArea(est.PostCode, fullAddress);
      const category = mapBusinessTypeToCategory(type, name);

      let coordinates: { lat: number; lng: number } | undefined;
      if (est.geocode?.latitude && est.geocode?.longitude) {
        const lat = parseFloat(est.geocode.latitude);
        const lng = parseFloat(est.geocode.longitude);
        if (!isNaN(lat) && !isNaN(lng) && lat > 53.6 && lat < 53.9) {
          coordinates = { lat, lng };
        }
      }

      const rating = est.RatingValue;
      const ratingText = rating ? `Official Food Standards Agency Rating: ${rating}/5.` : "";

      listings.push({
        id: `fsa-${est.FHRSID}`,
        name,
        slug: slugify(`${name}-${est.PostCode || area}`),
        description: `Independent Hull food and drink establishment in ${area}. ${ratingText}`,
        category,
        area,
        address: fullAddress,
        coordinates,
        featuredImage: getFoodImage(category, name),
        status: "published",
        isFeatured: false,
        isSponsored: false,
      });
    }
  } catch (err) {
    console.error("Error querying Food Standards Agency:", err);
  }
  return listings;
}
