export const CANONICAL_BASE = (process.env.SITE_URL ?? "https://www.hunow.co.uk").replace(/\/$/, "");
export const DEFAULT_OG_IMAGE = `${CANONICAL_BASE}/hunow.jpg`;

export function clampDescription(raw: string | undefined | null, fallbackTopic = "Hull events, food and culture"): string {
  let desc = (raw || "").trim().replace(/\s+/g, " ");
  if (!desc) {
    return `Discover the latest on ${fallbackTopic} across Kingston upon Hull and East Yorkshire with HU NOW's independent guide.`;
  }

  // If too short (< 100 chars), enrich with local Hull context
  if (desc.length < 100) {
    const enrichment = ` Independent coverage of ${fallbackTopic} across Kingston upon Hull and East Yorkshire.`;
    desc = (desc + enrichment).trim();
  }

  // If too long (> 155 chars), trim at clean word boundary
  if (desc.length > 155) {
    const cut = desc.slice(0, 152);
    const lastSpace = cut.lastIndexOf(" ");
    desc = (lastSpace > 110 ? cut.slice(0, lastSpace) : cut) + "...";
  }

  return desc;
}

export function formatTitle(title: string | undefined | null, suffix = "HU NOW"): string {
  let t = (title || "").trim();
  if (!t) return `HU NOW — Independent Guide to Hull & East Yorkshire`;

  if (t.endsWith(`— ${suffix}`) || t.endsWith(`- ${suffix}`)) {
    t = t.replace(/\s*([—-]\s*HU NOW)\s*$/, "").trim();
  }

  // Ensure title is between 40 and 60 chars
  if (t.length < 25) {
    t = `${t} in Hull & East Yorkshire`;
  }

  const full = `${t} — ${suffix}`;
  if (full.length > 65) {
    return `${t.slice(0, 55 - suffix.length).trim()}... — ${suffix}`;
  }
  return full;
}

export interface SeoMetaOptions {
  title: string;
  description?: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
  noIndex?: boolean;
}

export function buildSeoMeta(opts: SeoMetaOptions) {
  const title = formatTitle(opts.title);
  const description = clampDescription(opts.description, opts.title);
  const canonicalUrl = `${CANONICAL_BASE}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}`;
  const image = opts.image || DEFAULT_OG_IMAGE;
  const type = opts.type || "website";

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:image", content: image },
    { property: "og:type", content: type },
    { property: "og:site_name", content: "HU NOW" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];

  if (opts.noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  if (opts.publishedTime) {
    meta.push({ property: "article:published_time", content: opts.publishedTime });
  }

  if (opts.author) {
    meta.push({ property: "article:author", content: opts.author });
  }

  return {
    meta,
    links: [{ rel: "canonical", href: canonicalUrl }],
  };
}
