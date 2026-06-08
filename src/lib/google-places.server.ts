const BASE = "https://maps.googleapis.com/maps/api/place";

function apiKey() {
  const k = process.env.GOOGLE_PLACES_API_KEY;
  if (!k) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  return k;
}

export interface PlaceSuggestion {
  placeId: string;
  description: string;
}

export interface PlaceDetails {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  lat?: number;
  lng?: number;
  openingHours?: string;
  photo?: string;
  rating?: number;
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const url = new URL(`${BASE}/autocomplete/json`);
  url.searchParams.set("input", query);
  url.searchParams.set("key", apiKey());
  url.searchParams.set("types", "establishment");
  // Bias towards Hull, UK
  url.searchParams.set("location", "53.7457,-0.3367");
  url.searchParams.set("radius", "25000");
  url.searchParams.set("components", "country:gb");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Places API error ${res.status}`);
  const data = (await res.json()) as {
    predictions?: Array<{ place_id: string; description: string }>;
    status: string;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places: ${data.status}`);
  }

  return (data.predictions ?? []).map((p) => ({
    placeId: p.place_id,
    description: p.description,
  }));
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const fields = [
    "name",
    "formatted_address",
    "formatted_phone_number",
    "website",
    "geometry",
    "opening_hours",
    "photos",
    "rating",
  ].join(",");

  const url = new URL(`${BASE}/details/json`);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", fields);
  url.searchParams.set("key", apiKey());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Places API error ${res.status}`);
  const data = (await res.json()) as {
    result?: {
      name?: string;
      formatted_address?: string;
      formatted_phone_number?: string;
      website?: string;
      geometry?: { location?: { lat?: number; lng?: number } };
      opening_hours?: { weekday_text?: string[] };
      photos?: Array<{ photo_reference: string }>;
      rating?: number;
    };
    status: string;
  };

  if (data.status !== "OK") throw new Error(`Google Places: ${data.status}`);
  const r = data.result ?? {};

  let photo: string | undefined;
  if (r.photos?.[0]?.photo_reference) {
    const photoUrl = new URL(`${BASE}/photo`);
    photoUrl.searchParams.set("maxwidth", "1200");
    photoUrl.searchParams.set("photo_reference", r.photos[0].photo_reference);
    photoUrl.searchParams.set("key", apiKey());
    photo = photoUrl.toString();
  }

  return {
    name: r.name ?? "",
    address: r.formatted_address ?? "",
    phone: r.formatted_phone_number,
    website: r.website,
    lat: r.geometry?.location?.lat,
    lng: r.geometry?.location?.lng,
    openingHours: r.opening_hours?.weekday_text?.join("\n"),
    photo,
    rating: r.rating,
  };
}
