const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function parseUtcDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00Z`);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format event dates deterministically without platform ICU differences.
 * E.g. "Thu 3 Sep"
 */
export function formatEventDate(dateStr: string): string {
  const d = parseUtcDate(dateStr);
  if (!d) return "";
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/**
 * Format day of week for spotlight cards.
 * E.g. "THU"
 */
export function formatWeekday(dateStr: string): string {
  const d = parseUtcDate(dateStr);
  if (!d) return "";
  return DAYS[d.getUTCDay()].toUpperCase();
}

/**
 * Format full date for masthead or articles.
 * E.g. "Thursday 3 September 2026"
 */
export function formatFullDate(dateStr?: string | Date): string {
  const d = typeof dateStr === "string" ? parseUtcDate(dateStr) : (dateStr || new Date());
  if (!d || isNaN(d.getTime())) return "";
  return `${FULL_DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${FULL_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Format offer expiration date.
 * E.g. "30/09/2026"
 */
export function formatShortDate(dateStr: string): string {
  const d = parseUtcDate(dateStr);
  if (!d) return "";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
