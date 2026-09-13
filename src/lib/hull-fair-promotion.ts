import type { EventItem } from "@/types";

export function isHullFairEvent(event: EventItem) {
  return /^hull-fair-\d{4}$/.test(event.slug) || /^Hull Fair \d{4}/i.test(event.title);
}

export function getHullFairPromotion(events: EventItem[], today: string) {
  const event = events
    .filter(
      (candidate) =>
        candidate.status === "published" &&
        isHullFairEvent(candidate) &&
        (candidate.endDate || candidate.startDate) >= today,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  if (!event) return undefined;

  return {
    event,
    isLive: event.startDate <= today && (event.endDate || event.startDate) >= today,
  };
}

export function formatHullFairDateRange(event: EventItem) {
  const start = new Date(`${event.startDate}T12:00:00`);
  const end = new Date(`${event.endDate || event.startDate}T12:00:00`);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${end.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    })}`;
  }

  return `${start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })}–${end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}
