import { describe, expect, test } from "bun:test";
import type { EventItem } from "@/types";
import { formatHullFairDateRange, getHullFairPromotion } from "./hull-fair-promotion";

function hullFair(year: number): EventItem {
  return {
    id: `fair-${year}`,
    title: `Hull Fair ${year}`,
    slug: `hull-fair-${year}`,
    description: "Hull Fair guide",
    category: "Family",
    startDate: `${year}-10-09`,
    endDate: `${year}-10-17`,
    startTime: "16:00",
    endTime: "23:00",
    locationName: "Walton Street",
    address: "Hull",
    price: "Free entry",
    isFree: true,
    featuredImage: "",
    status: "published",
    isFeatured: true,
    isSponsored: false,
  };
}

describe("Hull Fair homepage promotion", () => {
  test("shows an upcoming edition", () => {
    const promotion = getHullFairPromotion([hullFair(2026)], "2026-09-13");
    expect(promotion?.event.slug).toBe("hull-fair-2026");
    expect(promotion?.isLive).toBe(false);
  });

  test("marks the fair live throughout its final day", () => {
    expect(getHullFairPromotion([hullFair(2026)], "2026-10-17")?.isLive).toBe(true);
  });

  test("hides an expired edition", () => {
    expect(getHullFairPromotion([hullFair(2026)], "2026-10-18")).toBeUndefined();
  });

  test("selects the nearest future edition", () => {
    const promotion = getHullFairPromotion([hullFair(2027), hullFair(2026)], "2026-10-18");
    expect(promotion?.event.slug).toBe("hull-fair-2027");
  });

  test("formats a same-month date range", () => {
    expect(formatHullFairDateRange(hullFair(2026))).toBe("9–17 October 2026");
  });
});
