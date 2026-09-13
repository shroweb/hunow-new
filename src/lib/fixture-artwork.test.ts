import { describe, expect, test } from "bun:test";
import type { EventItem } from "@/types";
import { getFixtureMatchup, teamInitials } from "./fixture-artwork";

function event(title: string, category = "Sport") {
  return { title, category } as EventItem;
}

describe("fixture artwork", () => {
  test("extracts home and away teams from a fixture title", () => {
    expect(getFixtureMatchup(event("Hull City vs Everton"))).toEqual({
      home: "Hull City",
      away: "Everton",
    });
  });

  test("removes the imported away marker", () => {
    expect(getFixtureMatchup(event("Newcastle United vs Hull City (Away)"))).toEqual({
      home: "Newcastle United",
      away: "Hull City",
    });
  });

  test("ignores non-sport events and titles without a matchup", () => {
    expect(getFixtureMatchup(event("Tea Dance", "Arts"))).toBeUndefined();
    expect(getFixtureMatchup(event("Hull City Open Day"))).toBeUndefined();
  });

  test("creates compact team initials", () => {
    expect(teamInitials("Hull City AFC")).toBe("HC");
    expect(teamInitials("Newcastle United")).toBe("NU");
  });
});
