import { useEffect, useState } from "react";
import { getLocalStatusFn } from "@/lib/public.functions";
import type { LocalStatus } from "@/lib/local-status.server";

const INITIAL_STATUS: LocalStatus = {
  bridge: {
    status: "OPEN TO ALL TRAFFIC",
    windSpeedMph: 14,
    windGustMph: 23,
    badgeColor: "green",
  },
  weather: {
    tempC: 21,
    condition: "Overcast",
    icon: "☁️",
    windMph: 11,
  },
  tide: {
    levelMeters: 4.8,
    status: "Normal",
  },
  updatedAt: new Date().toISOString(),
};

export function LocalStatusTicker() {
  const [status, setStatus] = useState<LocalStatus>(INITIAL_STATUS);

  useEffect(() => {
    getLocalStatusFn()
      .then((s) => {
        if (s) setStatus(s);
      })
      .catch(() => {});

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      getLocalStatusFn()
        .then((s) => {
          if (s) setStatus(s);
        })
        .catch(() => {});
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const bridgeBadge =
    status.bridge.badgeColor === "green"
      ? "bg-emerald-500 text-white"
      : status.bridge.badgeColor === "amber"
      ? "bg-amber-500 text-black"
      : "bg-rose-600 text-white";

  return (
    <div className="bg-black/30 text-background border-b border-white/10 text-[11px] font-mono py-2.5 px-4 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 whitespace-nowrap">
        {/* Left: Bridge & Weather */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-wider">🌉 HUMBER BRIDGE:</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${bridgeBadge}`}>
              {status.bridge.status}
            </span>
            <span className="text-background/60 text-[10px] hidden sm:inline">
              ({status.bridge.windSpeedMph}mph, gusts {status.bridge.windGustMph}mph)
            </span>
          </div>

          <span className="text-background/30">•</span>

          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-wider">⛅ HULL:</span>
            <span>
              {status.weather.tempC}°C {status.weather.condition}
            </span>
          </div>
        </div>

        {/* Right: Estuary Tides */}
        <div className="hidden md:flex items-center gap-2 text-background/80 text-[10px]">
          <span>🌊 VICTORIA PIER:</span>
          <span className="font-bold text-background">{status.tide.status}</span>
          {status.tide.levelMeters != null && (
            <span className="text-background/60">({status.tide.levelMeters}m)</span>
          )}
        </div>
      </div>
    </div>
  );
}
