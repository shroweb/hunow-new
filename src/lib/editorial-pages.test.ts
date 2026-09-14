import { describe, expect, test } from "bun:test";
import { seedArticles } from "@/data/seed";

const NEW_GUIDE_SLUGS = [
  "hull-fair-ride-prices-2026",
  "hull-fair-food-guide",
  "hull-fair-family-guide-2026",
  "hull-fair-accessibility-guide-2026",
  "brantingham-park-fireworks-2026",
];

const KNOWN_THIN_ARTICLES = [
  "hull-fair-opening-times-2026:128",
  "hull-fair-buses-2026:181",
  "secret-garden-cafe-whitefriargate:117",
  "10-minutes-spray-k:127",
  "old-town-foodie-hub:121",
  "hull-maker-spaces:114",
  "weekend-guide-first-time:128",
  "where-to-drink-summer:118",
];

function wordCount(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

describe("new editorial guides", () => {
  test("keeps every published seed article above the thin-content floor", () => {
    const thin = seedArticles
      .filter((article) => article.status === "published" && wordCount(article.content) < 225)
      .map((article) => `${article.slug}:${wordCount(article.content)}`);
    expect(thin).toEqual(KNOWN_THIN_ARTICLES);
  });

  test("publishes all five requested pages with useful depth", () => {
    for (const slug of NEW_GUIDE_SLUGS) {
      const article = seedArticles.find((item) => item.slug === slug);
      expect(article?.status).toBe("published");
      expect(wordCount(article?.content ?? "")).toBeGreaterThanOrEqual(225);
      expect(article?.seo?.description.length).toBeGreaterThanOrEqual(100);
    }
  });

  test("keeps unconfirmed fireworks locations clearly labelled", () => {
    const article = seedArticles.find(
      (item) => item.slug === "hull-bonfire-night-fireworks-guide-2026",
    );
    expect(article?.content).toContain("Awaiting 2026 Confirmation");
    expect(article?.content).toContain("Do not travel based on previous years' schedules");
  });
});
