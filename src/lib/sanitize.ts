/**
 * Lightweight HTML sanitizer — strips dangerous tags/attributes.
 * For production, replace with DOMPurify when package install is available.
 */

const ALLOWED_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h2",
  "h3",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "ul",
]);

const DANGEROUS_TAGS =
  /<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|button|link|meta|style|base|svg|math|applet|audio|video|source|template)\b[^>]*>/gi;
const EVENT_HANDLERS = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URLS = /href\s*=\s*["']?\s*javascript:/gi;
const DATA_URLS = /src\s*=\s*["']?\s*data:/gi;

export function sanitizeHtml(html: string): string {
  return html
    .replace(DANGEROUS_TAGS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JAVASCRIPT_URLS, 'href="javascript:void(0)"')
    .replace(DATA_URLS, 'src=""');
}

/** Escape text for safe interpolation into HTML attributes */
export function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
