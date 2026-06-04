import { useState } from "react";
import type { SeoMeta } from "@/types";

interface Props {
  defaultValue?: SeoMeta;
  /** Suggested fallback values shown as placeholders */
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackImage?: string;
}

const cls = "w-full bg-white border border-foreground/20 px-3 py-2 font-mono text-xs";

// Backend integration point: persist these fields alongside the entity
// and consume them in the public detail route's head() for SEO/social.
export function SeoFields({
  defaultValue,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
}: Props) {
  const [open, setOpen] = useState(false);
  const v = defaultValue ?? {};

  const titleLen = v.title?.length ?? 0;
  const descLen = v.description?.length ?? 0;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="border border-foreground/30 bg-stone-50"
    >
      <summary className="cursor-pointer select-none px-4 py-3 text-[10px] font-mono uppercase tracking-widest flex items-center justify-between">
        <span>SEO & Social</span>
        <span className="text-muted-foreground">{open ? "Hide" : "Edit"}</span>
      </summary>
      <div className="p-4 space-y-3 border-t border-foreground/20">
        <div>
          <label className="block text-[10px] font-mono uppercase mb-1">
            Meta title <span className="text-muted-foreground">({titleLen}/60 recommended)</span>
          </label>
          <input
            name="seo.title"
            defaultValue={v.title}
            placeholder={fallbackTitle ?? "Defaults to post title"}
            className={cls}
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase mb-1">
            Meta description{" "}
            <span className="text-muted-foreground">({descLen}/160 recommended)</span>
          </label>
          <textarea
            name="seo.description"
            defaultValue={v.description}
            rows={2}
            placeholder={fallbackDescription ?? "Defaults to excerpt"}
            className={cls}
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase mb-1">
            Social share image URL
          </label>
          <input
            name="seo.ogImage"
            defaultValue={v.ogImage}
            placeholder={fallbackImage ?? "Defaults to featured image"}
            className={cls}
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase mb-1">
            Canonical URL <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            name="seo.canonicalUrl"
            defaultValue={v.canonicalUrl}
            placeholder="Leave blank for default"
            className={cls}
          />
        </div>
        <label className="flex items-center gap-2 text-[11px] font-mono uppercase pt-1">
          <input type="checkbox" name="seo.noIndex" defaultChecked={v.noIndex} />
          Hide from search engines (noindex)
        </label>
      </div>
    </details>
  );
}
