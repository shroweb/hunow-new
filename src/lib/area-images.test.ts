import { describe, expect, test } from "bun:test";
import { AREA_IMAGES, isGenericAreaImage, resolveAreaImage } from "./area-images";

describe("area imagery", () => {
  test("provides a specific image for every default Hull area", () => {
    const slugs = [
      "old-town",
      "fruit-market",
      "city-centre",
      "avenues",
      "hessle-road",
      "marina",
      "east-hull",
      "bransholme",
      "kingswood",
      "beverley-road",
      "anlaby-road",
      "spring-bank",
    ];
    expect(Object.keys(AREA_IMAGES).sort()).toEqual(slugs.sort());
    expect(slugs.every((slug) => Boolean(AREA_IMAGES[slug]?.src))).toBe(true);
  });

  test("replaces blank and Unsplash area placeholders", () => {
    expect(isGenericAreaImage("")).toBe(true);
    expect(isGenericAreaImage("https://images.unsplash.com/photo-example")).toBe(true);
    expect(resolveAreaImage("old-town", "").src).toBe(AREA_IMAGES["old-town"].src);
  });

  test("preserves an editor supplied image", () => {
    const uploaded = "https://assets.example.com/hull/old-town.jpg";
    expect(resolveAreaImage("old-town", uploaded)).toEqual({
      src: uploaded,
      alt: "old town in Hull",
    });
  });
});
