import { describe, expect, test } from "bun:test";
import { seedArticles } from "@/data/seed";

describe("Hull Fair parking guide", () => {
  const article = seedArticles.find((item) => item.slug === "guide-to-parking-at-hull-fair");

  test("agrees with the council's 2026 park-and-ride sites and opening hours", () => {
    expect(article).toBeDefined();
    expect(article!.content).toContain("Humber Bridge Park & Ride");
    expect(article!.content).not.toContain("Craven Park Park & Ride");
    expect(article!.content).toContain("4:00 PM on the first Friday");
    expect(article!.content).toContain("2:00 PM Monday to Friday");
    expect(article!.content).not.toContain("12:00 PM (noon) daily");
    expect(article!.content).toContain("https://www.hull.gov.uk/leisure/hull-fair/3");
  });
});
