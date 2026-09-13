import type { EventItem } from "@/types";

const ANNUAL_LEAD_MONTHS = 6;

function addYear(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const nextYear = year + 1;
  const lastDay = new Date(Date.UTC(nextYear, month, 0)).getUTCDate();
  return [
    nextYear,
    String(month).padStart(2, "0"),
    String(Math.min(day, lastDay)).padStart(2, "0"),
  ].join("-");
}

function replaceYear(value: string | undefined, fromYear: number, toYear: number) {
  return value?.replaceAll(String(fromYear), String(toYear));
}

export function createAnnualSuccessor(event: EventItem, now = new Date()): EventItem | undefined {
  if (event.recurrence?.type !== "annual") return undefined;

  const fromYear = Number(event.startDate.slice(0, 4));
  if (!Number.isInteger(fromYear)) return undefined;

  const nextStartDate = addYear(event.startDate);
  if (event.recurrence.until && nextStartDate > event.recurrence.until) return undefined;
  const generationDate = new Date(`${nextStartDate}T12:00:00Z`);
  generationDate.setUTCMonth(generationDate.getUTCMonth() - ANNUAL_LEAD_MONTHS);
  if (now < generationDate) return undefined;

  const toYear = fromYear + 1;
  return {
    ...event,
    id: `${event.id}-annual-${toYear}`,
    title: replaceYear(event.title, fromYear, toYear) || event.title,
    slug: replaceYear(event.slug, fromYear, toYear) || `${event.slug}-${toYear}`,
    description: replaceYear(event.description, fromYear, toYear) || event.description,
    content: replaceYear(event.content, fromYear, toYear),
    startDate: nextStartDate,
    endDate: event.endDate ? addYear(event.endDate) : undefined,
    scheduledFor: undefined,
    status: "published",
    seo: event.seo
      ? {
          ...event.seo,
          title: replaceYear(event.seo.title, fromYear, toYear),
          description: replaceYear(event.seo.description, fromYear, toYear),
        }
      : undefined,
  };
}
