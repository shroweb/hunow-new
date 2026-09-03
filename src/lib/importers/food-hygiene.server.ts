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

function getFoodImage(category: string): string {
  if (category === "Bars & Pubs") {
    return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&h=800&q=80";
  }
  if (category === "Cafes") {
    return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&h=800&q=80";
  }
  return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=800&q=80";
}

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
        featuredImage: getFoodImage(category),
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
