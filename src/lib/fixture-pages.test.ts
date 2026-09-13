import { describe, expect, test } from "bun:test";
import type { EventItem } from "@/types";
import { eventMatchesFixtureTeam } from "./fixture-pages";

function fixture(title: string, description: string, locationName: string): EventItem {
  return {
    id: title,
    title,
    slug: title.toLowerCase().replaceAll(" ", "-"),
    description,
    category: "Sport",
    startDate: "2026-10-01",
    startTime: "15:00",
    locationName,
    address: "Hull",
    price: "",
    isFree: false,
    featuredImage: "",
    status: "published",
    isFeatured: false,
    isSponsored: false,
  };
}

describe("fixture landing page matching", () => {
  test("keeps Hull City and Hull FC fixtures separate at their shared stadium", () => {
    const city = fixture("Hull City vs Bristol City", "Championship football", "MKM Stadium");
    const fc = fixture("Hull FC vs Leeds Rhinos", "Super League rugby", "MKM Stadium");

    expect(eventMatchesFixtureTeam(city, "hull-city")).toBe(true);
    expect(eventMatchesFixtureTeam(city, "hull-fc")).toBe(false);
    expect(eventMatchesFixtureTeam(fc, "hull-fc")).toBe(true);
    expect(eventMatchesFixtureTeam(fc, "hull-city")).toBe(false);
  });

  test("matches Hull KR home fixtures by venue", () => {
    const kr = fixture("Hull Kingston Rovers vs Wigan", "Super League", "Craven Park");
    expect(eventMatchesFixtureTeam(kr, "hull-kr")).toBe(true);
  });

  test("excludes drafts", () => {
    const draft = {
      ...fixture("Hull City vs Norwich", "Football", "MKM Stadium"),
      status: "draft" as const,
    };
    expect(eventMatchesFixtureTeam(draft, "hull-city")).toBe(false);
  });
});
