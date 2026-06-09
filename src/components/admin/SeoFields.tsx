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

function LenHint({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const over = len > max;
  return (
    <span className={over ? "text-red-500 font-bold" : "text-muted-foreground"}>
      {len}/{max}{over ? " — too long" : ""}
    </span>
  );
}

export function SeoFields({
  defaultValue,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
}: Props) {
  const [open, setOpen] = useState(false);
  const v = defaultValue ?? {};
  const [titleVal, setTitleVal] = useState(v.title ?? "");
  const [descVal, setDescVal] = useState(v.description ?? "");

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
        {/* Google preview */}
        {(titleVal || fallbackTitle) && (
          <div className="bg-white border border-foreground/10 p-3 rounded text-xs mb-1">
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Google preview</div>
            <div className="text-[#1a0dab] text-sm leading-snug truncate">
              {titleVal || fallbackTitle}
            </div>
            <div className="text-[#006621] text-[11px]">hunow.co.uk</div>
            <div className="text-[#545454] text-[11px] line-clamp-2 mt-0.5">
              {descVal || fallbackDescription || "No description set."}
            </div>
          </div>
        )}
        <div>
          <label className="block text-[10px] font-mono uppercase mb-1">
            Meta title <LenHint value={titleVal} max={60} />
          </label>
          <input
            name="seo.title"
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            placeholder={fallbackTitle ?? "Defaults to post title"}
            className={cls}
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase mb-1">
            Meta description <LenHint value={descVal} max={160} />
          </label>
          <textarea
            name="seo.description"
            value={descVal}
            onChange={(e) => setDescVal(e.target.value)}
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
