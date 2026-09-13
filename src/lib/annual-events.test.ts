import { describe, expect, test } from "bun:test";
import type { EventItem } from "@/types";
import { createAnnualSuccessor } from "./annual-events";

const annualEvent: EventItem = {
  id: "hull-fair",
  title: "Hull Fair 2026",
  slug: "hull-fair-2026",
  description: "Hull Fair returns in 2026.",
  content: "<p>Plan your 2026 visit.</p>",
  category: "Family",
  startDate: "2026-10-09",
  endDate: "2026-10-17",
  startTime: "16:00",
  endTime: "23:00",
  locationName: "Walton Street",
  address: "Hull",
  price: "Free entry",
  isFree: true,
  featuredImage: "/hull-fair.jpg",
  status: "published",
  isFeatured: true,
  isSponsored: false,
  recurrence: { type: "annual" },
  seo: { title: "Hull Fair 2026", description: "Visit Hull Fair in 2026." },
};

describe("createAnnualSuccessor", () => {
  test("waits until six months before next year's event", () => {
    expect(createAnnualSuccessor(annualEvent, new Date("2027-04-08T23:59:59Z"))).toBeUndefined();
  });

  test("creates a published next-year page at the six-month threshold", () => {
    const next = createAnnualSuccessor(annualEvent, new Date("2027-04-09T12:00:00Z"));

    expect(next).toMatchObject({
      id: "hull-fair-annual-2027",
      title: "Hull Fair 2027",
      slug: "hull-fair-2027",
      description: "Hull Fair returns in 2027.",
      content: "<p>Plan your 2027 visit.</p>",
      startDate: "2027-10-09",
      endDate: "2027-10-17",
      status: "published",
      recurrence: { type: "annual" },
      seo: { title: "Hull Fair 2027", description: "Visit Hull Fair in 2027." },
    });
  });

  test("does not generate successors for other recurrence types", () => {
    expect(
      createAnnualSuccessor(
        { ...annualEvent, recurrence: { type: "monthly" } },
        new Date("2027-04-09T12:00:00Z"),
      ),
    ).toBeUndefined();
  });

  test("honours the optional repeat-until date", () => {
    expect(
      createAnnualSuccessor(
        { ...annualEvent, recurrence: { type: "annual", until: "2027-01-01" } },
        new Date("2027-04-09T12:00:00Z"),
      ),
    ).toBeUndefined();
  });

  test("keeps leap-day events on the final day of February", () => {
    const leapEvent = { ...annualEvent, startDate: "2028-02-29", endDate: undefined };
    expect(createAnnualSuccessor(leapEvent, new Date("2028-08-28T12:00:00Z"))?.startDate).toBe(
      "2029-02-28",
    );
  });
});
