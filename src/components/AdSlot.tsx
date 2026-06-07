import { useEffect, useMemo } from "react";
import { img } from "@/data/seed";
import { trackAdEvent } from "@/lib/ad.functions";
import { useStore } from "@/lib/store";

export function AdSlot({ placement }: { placement: string }) {
  const ads = useStore((s) => s.ads);
  const ad = useMemo(
    () => ads.find((item) => item.status === "active" && item.placement === placement),
    [ads, placement],
  );

  useEffect(() => {
    if (!ad) return;
    void trackAdEvent({ data: { adId: ad.id, eventType: "impression" } });
  }, [ad]);

  if (!ad) return null;

  const click = () => {
    void trackAdEvent({ data: { adId: ad.id, eventType: "click" } });
  };

  return (
    <aside className="border-2 border-foreground bg-white">
      <div className="flex items-center justify-between gap-3 border-b-2 border-foreground px-3 py-2">
        <span className="text-[10px] font-mono uppercase text-muted-foreground">Advertisement</span>
        <span className="text-[10px] font-mono uppercase text-accent">{placement}</span>
      </div>
      <a href={ad.url} target="_blank" rel="noreferrer sponsored" onClick={click} className="block">
        <div className="aspect-[16/9] bg-stone-200 overflow-hidden">
          <img
            src={img(ad.image, 900, 506)}
            alt={`${ad.advertiserName} advertisement`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider">
          {ad.advertiserName}
        </div>
      </a>
    </aside>
  );
}
