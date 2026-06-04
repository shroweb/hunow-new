import type { EventItem } from "@/types";

function toICSDate(date: string, time: string): string {
  // date: YYYY-MM-DD, time: HH:MM -> YYYYMMDDTHHMMSS (floating local time)
  const d = date.replace(/-/g, "");
  const t = (time || "00:00").replace(":", "") + "00";
  return `${d}T${t}`;
}

export function buildICS(event: EventItem): string {
  const start = toICSDate(event.startDate, event.startTime);
  const end = toICSDate(event.startDate, event.endTime || event.startTime);
  const uid = `${event.id}@hunow.local`;
  const stamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HU NOW//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description)}`,
    `LOCATION:${escape(`${event.locationName}, ${event.address}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function escape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function downloadICS(event: EventItem) {
  const blob = new Blob([buildICS(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.slug}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function googleCalUrl(event: EventItem): string {
  const s = toICSDate(event.startDate, event.startTime);
  const e = toICSDate(event.startDate, event.endTime || event.startTime);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${s}/${e}`,
    details: event.description,
    location: `${event.locationName}, ${event.address}`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
