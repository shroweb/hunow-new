import type { Pool } from "pg";
import type { EventItem, Listing } from "@/types";

export function normalizeString(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s]/g, " ")   // replace punctuation with space
    .replace(/\s+/g, " ")            // collapse whitespace
    .trim();
}

export function normalizePostcode(pc: string): string {
  return (pc || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function slugify(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const MINOR_WORDS = new Set([
  "a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to",
  "from", "by", "with", "in", "of", "vs", "v", "via", "featuring"
]);

const SPECIAL_CASES = new Map([
  ["fc", "FC"],
  ["kr", "KR"],
  ["uk", "UK"],
  ["kc", "KC"],
  ["mkm", "MKM"],
  ["dj", "DJ"],
  ["vip", "VIP"],
  ["cbeebies", "CBeebies"],
  ["bbc", "BBC"],
  ["fsa", "FSA"],
  ["qa", "Q&A"],
  ["q&a", "Q&A"],
  ["lol", "LOL"],
  ["ub40", "UB40"],
  ["5k", "5k"],
  ["10k", "10k"],
  ["live", "Live"],
  ["ii", "II"],
  ["iii", "III"],
  ["iv", "IV"],
]);

/**
 * Normalizes event titles: converts shouting ALL-CAPS titles into polished Title Case
 * while preserving standard acronyms (e.g. CBeebies, FC, KR, UB40).
 */
export function formatEventTitle(title: string): string {
  if (!title) return "";
  const trimmed = title.trim().replace(/\s+/g, " ");
  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  if (letters.length === 0) return trimmed;

  const upperCount = (letters.match(/[A-Z]/g) || []).length;
  const isAllCaps = upperCount / letters.length > 0.70 && letters.length > 3;

  if (!isAllCaps) {
    return trimmed;
  }

  const words = trimmed.split(" ");
  return words.map((word, i) => {
    const prevWord = i > 0 ? words[i - 1] : "";
    const isStartOfClause =
      i === 0 || prevWord.endsWith(":") || prevWord.endsWith("-") || prevWord.endsWith("—");

    const match = word.match(/^([^a-zA-Z0-9]*)(.*?)([^a-zA-Z0-9]*)$/);
    if (!match) return word;
    const [, pre, core, post] = match;
    const lower = core.toLowerCase();

    if (SPECIAL_CASES.has(lower)) {
      return pre + SPECIAL_CASES.get(lower) + post;
    }

    if (!isStartOfClause && MINOR_WORDS.has(lower)) {
      return pre + lower + post;
    }

    if (core.includes("-")) {
      const parts = core.split("-").map((p) => {
        const pLower = p.toLowerCase();
        if (SPECIAL_CASES.has(pLower)) return SPECIAL_CASES.get(pLower);
        return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
      });
      return pre + parts.join("-") + post;
    }

    if (core.includes("'") || core.includes("\u2019")) {
      const sep = core.includes("'") ? "'" : "\u2019";
      const parts = core.split(sep);
      return (
        pre +
        parts[0].charAt(0).toUpperCase() +
        parts[0].slice(1).toLowerCase() +
        sep +
        parts.slice(1).map((p) => p.toLowerCase()).join(sep) +
        post
      );
    }

    return pre + core.charAt(0).toUpperCase() + core.slice(1).toLowerCase() + post;
  }).join(" ");
}

/**
 * Check if an event already exists in the database by slug, ID, or (title + startDate).
 */
export async function findExistingEvent(
  pool: Pool,
  event: { title: string; startDate: string; locationName?: string; slug?: string },
): Promise<EventItem | null> {
  const normTitle = normalizeString(event.title);

  // 1. Direct slug match if provided
  if (event.slug) {
    const res = await pool.query<{ id: string; data: EventItem }>(
      "SELECT id, data FROM events WHERE data->>'slug' = $1 LIMIT 1",
      [event.slug],
    );
    if (res.rowCount && res.rowCount > 0) return res.rows[0].data;
  }

  // 2. Exact match on startDate
  const dateRes = await pool.query<{ id: string; data: EventItem }>(
    "SELECT id, data FROM events WHERE data->>'startDate' = $1",
    [event.startDate],
  );

  for (const row of dateRes.rows) {
    const existingTitle = normalizeString(row.data.title);
    // Exact or substring match (e.g. "Michael Ball 2026" vs "Michael Ball")
    if (
      existingTitle === normTitle ||
      (existingTitle.length > 5 && normTitle.includes(existingTitle)) ||
      (normTitle.length > 5 && existingTitle.includes(normTitle))
    ) {
      return row.data;
    }
  }

  return null;
}

export async function upsertEventDeduplicated(
  pool: Pool,
  rawEvent: EventItem,
): Promise<"created" | "updated" | "skipped"> {
  const cleanTitle = formatEventTitle(rawEvent.title);
  let cleanDesc = rawEvent.description || "";
  if (rawEvent.title !== cleanTitle && cleanDesc.includes(rawEvent.title)) {
    cleanDesc = cleanDesc.replaceAll(rawEvent.title, cleanTitle);
  }
  const event: EventItem = {
    ...rawEvent,
    title: cleanTitle,
    description: cleanDesc,
  };

  const existing = await findExistingEvent(pool, event);

  if (existing) {
    let changed = false;
    const merged = { ...existing };

    // Update title if existing has shouting all caps
    if (merged.title !== cleanTitle) {
      merged.title = cleanTitle;
      changed = true;
    }
    if (merged.description && rawEvent.title !== cleanTitle && merged.description.includes(rawEvent.title)) {
      merged.description = merged.description.replaceAll(rawEvent.title, cleanTitle);
      changed = true;
    }

    // Enrich missing fields from the new scrape
    if ((!merged.ticketUrl || merged.ticketUrl.length === 0) && event.ticketUrl) {
      merged.ticketUrl = event.ticketUrl;
      changed = true;
    }
    if ((!merged.featuredImage || merged.featuredImage.includes("placeholder")) && event.featuredImage) {
      merged.featuredImage = event.featuredImage;
      changed = true;
    }
    if ((!merged.description || merged.description.length < 20) && event.description && event.description.length > 20) {
      merged.description = event.description;
      changed = true;
    }
    if (!merged.coordinates && event.coordinates) {
      merged.coordinates = event.coordinates;
      changed = true;
    }

    if (changed) {
      await pool.query("UPDATE events SET data = $1 WHERE id = $2", [
        JSON.stringify(merged),
        existing.id,
      ]);
      return "updated";
    }
    return "skipped";
  }

  // Ensure unique slug
  let slug = event.slug || slugify(`${event.title}-${event.startDate}`);
  const slugCheck = await pool.query("SELECT 1 FROM events WHERE data->>'slug' = $1 LIMIT 1", [slug]);
  if (slugCheck.rowCount && slugCheck.rowCount > 0) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }
  const cleanEvent = { ...event, slug };

  await pool.query(
    "INSERT INTO events (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data",
    [cleanEvent.id, JSON.stringify(cleanEvent)],
  );
  return "created";
}

/**
 * Check if a place/listing already exists by FHRSID or (name + postcode).
 */
export async function findExistingListing(
  pool: Pool,
  listing: { name: string; postcode?: string; slug?: string; id?: string },
): Promise<Listing | null> {
  // 1. Check direct ID
  if (listing.id) {
    const res = await pool.query<{ id: string; data: Listing }>(
      "SELECT id, data FROM listings WHERE id = $1 LIMIT 1",
      [listing.id],
    );
    if (res.rowCount && res.rowCount > 0) return res.rows[0].data;
  }

  // 2. Check direct slug
  if (listing.slug) {
    const res = await pool.query<{ id: string; data: Listing }>(
      "SELECT id, data FROM listings WHERE data->>'slug' = $1 LIMIT 1",
      [listing.slug],
    );
    if (res.rowCount && res.rowCount > 0) return res.rows[0].data;
  }

  // 3. Check fuzzy name and postcode match
  const normName = normalizeString(listing.name);
  const normPc = normalizePostcode(listing.postcode || "");

  if (normName.length > 2) {
    const nameMatches = await pool.query<{ id: string; data: Listing }>(
      "SELECT id, data FROM listings WHERE LOWER(data->>'name') LIKE $1",
      [`%${normName.slice(0, 12)}%`],
    );

    for (const row of nameMatches.rows) {
      const existingName = normalizeString(row.data.name);
      const existingPc = normalizePostcode(row.data.address || "");
      if (existingName === normName) {
        // If postcodes match or either is missing, it is a duplicate
        if (!normPc || !existingPc || normPc === existingPc || existingPc.includes(normPc) || normPc.includes(existingPc)) {
          return row.data;
        }
      }
    }
  }

  return null;
}

export async function upsertListingDeduplicated(
  pool: Pool,
  listing: Listing,
): Promise<"created" | "updated" | "skipped"> {
  const existing = await findExistingListing(pool, {
    name: listing.name,
    postcode: listing.address,
    slug: listing.slug,
    id: listing.id,
  });

  if (existing) {
    let changed = false;
    const merged = { ...existing };

    // Update coordinates if existing lacked them
    if (!merged.coordinates && listing.coordinates) {
      merged.coordinates = listing.coordinates;
      changed = true;
    }
    // Update address if more complete
    if ((!merged.address || merged.address.length < (listing.address?.length || 0)) && listing.address) {
      merged.address = listing.address;
      changed = true;
    }

    if (changed) {
      await pool.query("UPDATE listings SET data = $1 WHERE id = $2", [
        JSON.stringify(merged),
        existing.id,
      ]);
      return "updated";
    }
    return "skipped";
  }

  // Ensure unique slug
  let slug = listing.slug || slugify(listing.name);
  const slugCheck = await pool.query("SELECT 1 FROM listings WHERE data->>'slug' = $1 LIMIT 1", [slug]);
  if (slugCheck.rowCount && slugCheck.rowCount > 0) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }
  const cleanListing = { ...listing, slug };

  await pool.query(
    "INSERT INTO listings (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data",
    [cleanListing.id, JSON.stringify(cleanListing)],
  );
  return "created";
}
