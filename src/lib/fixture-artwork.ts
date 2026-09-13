import type { EventItem } from "@/types";

export interface FixtureMatchup {
  home: string;
  away: string;
}

export function getFixtureMatchup(event: EventItem): FixtureMatchup | undefined {
  if (event.category.toLowerCase() !== "sport") return undefined;

  const cleanTitle = event.title.replace(/\s*\(away\)\s*$/i, "").trim();
  const teams = cleanTitle.split(/\s+vs\.?\s+/i).map((team) => team.trim());
  if (teams.length !== 2 || teams.some((team) => !team)) return undefined;

  return { home: teams[0], away: teams[1] };
}

export function teamInitials(team: string) {
  const words = team.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .filter((word) => !["afc", "fc", "rlfc"].includes(word.toLowerCase()))
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
