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
  const description = event.description.toLowerCase();
  const category = event.category.toLowerCase();
  const location = `${event.locationName} ${event.address}`.toLowerCase();
  const tags = (event.tags || []).map((tag) => tag.toLowerCase());

  if (team === "hull-city") {
    return (
      title.includes("hull city") ||
      description.includes("hull city") ||
      tags.some((tag) => tag.includes("hull city")) ||
      category === "hull-city" ||
      (location.includes("mkm stadium") &&
        title.includes("vs") &&
        !description.includes("rugby") &&
        !title.includes("hull fc"))
    );
  }

  if (team === "hull-fc") {
    return (
      ((title.includes("hull fc") || title.includes("hull f.c.")) && !title.includes("hull kr")) ||
      description.includes("hull fc") ||
      tags.some((tag) => tag.includes("hull fc")) ||
      category === "hull-fc" ||
      (location.includes("mkm stadium") &&
        (description.includes("super league") || description.includes("rugby")))
    );
  }

  return (
    title.includes("hull kr") ||
    title.includes("hull kingston") ||
    description.includes("hull kr") ||
    description.includes("hull kingston") ||
    tags.some(
      (tag) =>
        tag.includes("hull kr") || tag.includes("kingston rovers") || tag.includes("craven park"),
    ) ||
    category === "hull-kr" ||
    location.includes("craven park")
  );
}
