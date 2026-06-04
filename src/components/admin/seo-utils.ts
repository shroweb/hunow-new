import type { SeoMeta } from "@/types";

/** Pull SeoMeta out of a FormData submission. */
export function readSeo(fd: FormData): SeoMeta | undefined {
  const seo: SeoMeta = {
    title: String(fd.get("seo.title") || "") || undefined,
    description: String(fd.get("seo.description") || "") || undefined,
    ogImage: String(fd.get("seo.ogImage") || "") || undefined,
    canonicalUrl: String(fd.get("seo.canonicalUrl") || "") || undefined,
    noIndex: fd.get("seo.noIndex") === "on" || undefined,
  };
  const hasAny = Object.values(seo).some((x) => x !== undefined && x !== false);
  return hasAny ? seo : undefined;
}
