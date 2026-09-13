import type { EventItem } from "@/types";

export type FixtureTeam = "hull-city" | "hull-fc" | "hull-kr";

export const FIXTURE_TEAMS = {
  "hull-city": {
    name: "Hull City",
    sport: "Football",
    venue: "MKM Stadium",
    description:
      "Upcoming Hull City AFC fixtures, kick-off times and match details, including home games at the MKM Stadium and away matches.",
  },
  "hull-fc": {
    name: "Hull FC",
    sport: "Rugby League",
    venue: "MKM Stadium",
    description:
      "Upcoming Hull FC fixtures, kick-off times and match details for home and away Super League games.",
  },
  "hull-kr": {
    name: "Hull KR",
    sport: "Rugby League",
    venue: "Sewell Group Craven Park",
    description:
      "Upcoming Hull KR fixtures, kick-off times and match details for home and away Super League games.",
  },
} as const;

export function eventMatchesFixtureTeam(event: EventItem, team: FixtureTeam) {
  if (event.status !== "published") return false;

  const title = event.title.toLowerCase();
  const category = event.category.toLowerCase();
  const tags = (event.tags || []).map((tag) => tag.toLowerCase());
  const isMatchTitle = title.includes(" vs ") || title.includes(" (away)");

  if (team === "hull-city") {
    return (
      event.id.startsWith("hullcity-") ||
      event.slug.startsWith("hull-city-vs-") ||
      event.slug.startsWith("hull-city-at-") ||
      category === "hull-city" ||
      tags.some((tag) => tag === "hull city" || tag === "hull city afc") ||
      (isMatchTitle && title.includes("hull city") && !title.includes("hull fc"))
    );
  }

  if (team === "hull-fc") {
    return (
      event.id.startsWith("hullfc-") ||
      event.slug.startsWith("hull-fc-vs-") ||
      event.slug.startsWith("hull-fc-at-") ||
      category === "hull-fc" ||
      tags.some((tag) => tag === "hull fc" || tag === "hull f.c.") ||
      (isMatchTitle &&
        (title.includes("hull fc") || title.includes("hull f.c.")) &&
        !title.includes("hull kr"))
    );
  }

  return (
    event.id.startsWith("hullkr-") ||
    event.slug.startsWith("hull-kr-vs-") ||
    event.slug.startsWith("hull-kr-at-") ||
    category === "hull-kr" ||
    tags.some((tag) => tag === "hull kr" || tag === "hull kingston rovers") ||
    (isMatchTitle && (title.includes("hull kr") || title.includes("hull kingston rovers")))
  );
}
