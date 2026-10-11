export type ParsedSubscriber = {
  email: string;
  createdAt: string | null;
  segments: string[];
  isValid: boolean;
  error?: string;
  sourceRowNumber: number;
};

export type ParseSubscribersResult = {
  subscribers: ParsedSubscriber[];
  validCount: number;
  invalidCount: number;
  totalParsed: number;
  detectedHeaders: {
    emailColumn: string | null;
    dateColumn: string | null;
    segmentsColumn: string | null;
  };
};

/**
 * Standard RFC-4180 CSV tokenizer supporting quotes, escaped quotes,
 * commas, carriage returns, and newlines.
 */
export function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let inQuotes = false;
  let currentField = "";

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentField += '"';
      i++; // skip escaped quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++; // skip \n
      }
      currentRow.push(currentField.trim());
      // Only add non-empty rows
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  // Trailing field
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Safely parses human date formats like:
 * - "2026-04-18 21:38:30"
 * - "2026-04-18T21:38:30Z"
 * - "2026-04-18"
 * - "18/04/2026 21:38:30"
 * Returns ISO string or null if unparseable.
 */
export function parseSubscriberDate(dateStr?: string | null): string | null {
  if (!dateStr || !dateStr.trim()) return null;
  const cleaned = dateStr.trim();

  // Try replacing space between date and time with T
  const formatted = cleaned.includes(" ") && !cleaned.includes("T") ? cleaned.replace(" ", "T") : cleaned;

  const d = new Date(formatted);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }

  // UK date format DD/MM/YYYY or DD-MM-YYYY
  const matchUk = cleaned.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (matchUk) {
    const [, day, month, year, h = "00", m = "00", s = "00"] = matchUk;
    const dUk = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}Z`,
    );
    if (!isNaN(dUk.getTime())) {
      return dUk.toISOString();
    }
  }

  return null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXTRACT_EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

function isHeaderCell(val: string): boolean {
  const v = val.toLowerCase().trim();
  return (
    v === "subscriber" ||
    v === "subscribers" ||
    v === "email" ||
    v === "email address" ||
    v === "e-mail" ||
    v === "contact" ||
    v === "subscribed" ||
    v === "date" ||
    v === "created_at" ||
    v === "timestamp" ||
    v === "segments" ||
    v === "tags"
  );
}

/**
 * Parses raw text from a CSV file upload or copy-paste textarea into
 * a validated subscriber list with preserved subscription dates and tags.
 */
export function parseSubscribersText(
  rawContent: string,
  defaultSegments: ("events" | "offers" | "businesses")[] = [],
): ParseSubscribersResult {
  const content = rawContent.trim();
  if (!content) {
    return {
      subscribers: [],
      validCount: 0,
      invalidCount: 0,
      totalParsed: 0,
      detectedHeaders: { emailColumn: null, dateColumn: null, segmentsColumn: null },
    };
  }

  const rawRows = parseCsvRows(content);
  if (rawRows.length === 0) {
    return {
      subscribers: [],
      validCount: 0,
      invalidCount: 0,
      totalParsed: 0,
      detectedHeaders: { emailColumn: null, dateColumn: null, segmentsColumn: null },
    };
  }

  // Check if first row is a header
  const firstRow = rawRows[0];
  const firstRowHasHeaderWord = firstRow.some(isHeaderCell);
  const firstRowHasValidEmail = firstRow.some((c) => EMAIL_REGEX.test(c.trim().toLowerCase()));

  const hasHeader = firstRowHasHeaderWord || (!firstRowHasValidEmail && rawRows.length > 1);

  let emailColIdx = -1;
  let dateColIdx = -1;
  let segmentsColIdx = -1;
  let emailColName: string | null = null;
  let dateColName: string | null = null;
  let segmentsColName: string | null = null;

  if (hasHeader) {
    firstRow.forEach((cell, idx) => {
      const lower = cell.toLowerCase().trim();
      if (
        emailColIdx === -1 &&
        (lower === "subscriber" ||
          lower === "subscribers" ||
          lower === "email" ||
          lower === "email address" ||
          lower === "e-mail" ||
          lower === "contact" ||
          lower.includes("email") ||
          lower.includes("subscriber"))
      ) {
        emailColIdx = idx;
        emailColName = cell;
      } else if (
        dateColIdx === -1 &&
        (lower === "subscribed" ||
          lower === "subscribed at" ||
          lower === "date" ||
          lower === "date joined" ||
          lower === "signup date" ||
          lower === "created_at" ||
          lower === "created at" ||
          lower === "timestamp" ||
          lower.includes("subscribed") ||
          lower.includes("created"))
      ) {
        dateColIdx = idx;
        dateColName = cell;
      } else if (
        segmentsColIdx === -1 &&
        (lower === "segments" ||
          lower === "segment" ||
          lower === "tags" ||
          lower === "tag" ||
          lower === "groups" ||
          lower === "group" ||
          lower === "list")
      ) {
        segmentsColIdx = idx;
        segmentsColName = cell;
      }
    });
  }

  // If header didn't identify email column, scan first few data rows for the column containing emails
  const startRowIdx = hasHeader ? 1 : 0;
  if (emailColIdx === -1) {
    for (let r = startRowIdx; r < Math.min(rawRows.length, 5); r++) {
      const row = rawRows[r];
      const matchIdx = row.findIndex((c) => EMAIL_REGEX.test(c.trim()));
      if (matchIdx !== -1) {
        emailColIdx = matchIdx;
        if (hasHeader) emailColName = firstRow[matchIdx] || `Column ${matchIdx + 1}`;
        break;
      }
    }
  }

  // Default email to column 0 if still undetected
  if (emailColIdx === -1) {
    emailColIdx = 0;
  }

  const subscribers: ParsedSubscriber[] = [];
  const seenEmails = new Set<string>();

  for (let i = startRowIdx; i < rawRows.length; i++) {
    const row = rawRows[i];
    const sourceRowNumber = i + 1;

    let rawEmail = "";
    if (row.length === 1) {
      // Single column row, attempt regex extraction if formatted with name or symbols
      const cell = row[0].trim();
      const match = cell.match(EXTRACT_EMAIL_REGEX);
      rawEmail = match ? match[0] : cell;
    } else {
      rawEmail = row[emailColIdx] ? row[emailColIdx].trim() : "";
      if (!rawEmail) {
        // Fallback: search row for an email
        const cellWithEmail = row.find((c) => EMAIL_REGEX.test(c.trim()));
        if (cellWithEmail) rawEmail = cellWithEmail.trim();
      }
    }

    const normalisedEmail = rawEmail.toLowerCase().trim();

    if (!normalisedEmail) {
      continue; // Skip empty rows
    }

    const isValid = EMAIL_REGEX.test(normalisedEmail);
    let error: string | undefined;

    if (!isValid) {
      error = "Invalid email format";
    } else if (seenEmails.has(normalisedEmail)) {
      error = "Duplicate email in input (will be merged)";
    }

    // Extract date if column present
    let createdAt: string | null = null;
    if (dateColIdx !== -1 && row[dateColIdx]) {
      createdAt = parseSubscriberDate(row[dateColIdx]);
    }

    // Extract segments if column present
    const rowSegments: string[] = [];
    if (segmentsColIdx !== -1 && row[segmentsColIdx]) {
      const rawSeg = row[segmentsColIdx];
      const parts = rawSeg.split(/[,|;]/).map((s) => s.trim().toLowerCase());
      for (const p of parts) {
        if (p === "events" || p === "offers" || p === "businesses") {
          rowSegments.push(p);
        }
      }
    }

    // Combine with selected defaults
    const combinedSegments = Array.from(
      new Set(["all", ...defaultSegments, ...rowSegments]),
    );

    if (isValid && !seenEmails.has(normalisedEmail)) {
      seenEmails.add(normalisedEmail);
    }

    subscribers.push({
      email: normalisedEmail,
      createdAt,
      segments: combinedSegments,
      isValid,
      error,
      sourceRowNumber,
    });
  }

  const validCount = subscribers.filter((s) => s.isValid).length;
  const invalidCount = subscribers.length - validCount;

  return {
    subscribers,
    validCount,
    invalidCount,
    totalParsed: subscribers.length,
    detectedHeaders: {
      emailColumn: emailColName,
      dateColumn: dateColName,
      segmentsColumn: segmentsColName,
    },
  };
}
