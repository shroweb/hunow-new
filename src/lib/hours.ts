import type { WeekHours, DayKey, DayHours } from "@/types";

const DAY_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABEL: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

function todayKey(d = new Date()): DayKey {
  // JS: 0=Sun..6=Sat. Map to our keys.
  const map: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[d.getDay()];
}

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function openStatus(
  hours: WeekHours | undefined,
  now = new Date(),
): {
  open: boolean;
  label: string;
} {
  if (!hours) return { open: false, label: "Hours not listed" };
  const today = hours[todayKey(now)];
  const cur = now.getHours() * 60 + now.getMinutes();
  if (today) {
    const o = toMinutes(today.open);
    const c = toMinutes(today.close);
    if (cur >= o && cur < c) return { open: true, label: `Open · closes ${today.close}` };
    if (cur < o) return { open: false, label: `Opens ${today.open}` };
  }
  // Find next open day
  const startIdx = DAY_ORDER.indexOf(todayKey(now));
  for (let i = 1; i <= 7; i++) {
    const k = DAY_ORDER[(startIdx + i) % 7];
    const d = hours[k];
    if (d) return { open: false, label: `Closed · opens ${DAY_LABEL[k]} ${d.open}` };
  }
  return { open: false, label: "Closed" };
}

export function formatWeek(hours: WeekHours | undefined): { label: string; value: string }[] {
  if (!hours) return [];
  return DAY_ORDER.map((k) => ({
    label: DAY_LABEL[k],
    value: hours[k]
      ? `${(hours[k] as Exclude<DayHours, null>).open} – ${(hours[k] as Exclude<DayHours, null>).close}`
      : "Closed",
  }));
}
