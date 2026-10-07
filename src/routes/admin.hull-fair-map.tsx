import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  FairPOI,
  FairCategory,
  FAIR_CATEGORIES,
  HULL_FAIR_POIS,
} from "@/data/hull-fair-map-data";
import { saveHullFairPoisFn, getHullFairPoisFn } from "@/lib/hull-fair-map.functions";
import {
  MapPin,
  Search,
  Save,
  RotateCcw,
  Copy,
  ExternalLink,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  Crosshair,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/hull-fair-map")({
  component: AdminHullFairMapPage,
});

export function AdminHullFairMapPage() {
  const [pois, setPois] = useState<FairPOI[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem("hull_fair_custom_pois");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return HULL_FAIR_POIS;
  });

  const [activePoiId, setActivePoiId] = useState<string>(pois[0]?.id || "");
  const [selectedCategory, setSelectedCategory] = useState<FairCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const leafletModuleRef = useRef<any>(null);

  // Active POI
  const activePoi = useMemo(
    () => pois.find((p) => p.id === activePoiId) || pois[0],
    [pois, activePoiId]
  );

  // Filtered POIs for sidebar
  const filteredPois = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return pois.filter((p) => {
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.operator.toLowerCase().includes(q) ||
        p.locationArea.toLowerCase().includes(q)
      );
    });
  }, [pois, selectedCategory, searchQuery]);

  // Load latest from server DB on mount
  useEffect(() => {
    getHullFairPoisFn()
      .then((res) => {
        if (res?.pois && res.pois.length > 0) {
          setPois(res.pois);
        }
      })
      .catch((err) => {
        console.warn("Could not load from DB, using current data:", err);
      });
  }, []);

  // Ensure leaflet stylesheet is present
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = document.getElementById("leaflet-stylesheet");
    if (!existing) {
      const link = document.createElement("link");
      link.id = "leaflet-stylesheet";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let destroyed = false;

    import("leaflet").then((L) => {
      if (destroyed || !mapContainerRef.current) return;
      leafletModuleRef.current = L.default || L;
      const Leaflet = leafletModuleRef.current;

      const mapHeight = 1000;
      const mapWidth = 1429.2;
      const bounds: [[number, number], [number, number]] = [
        [0, 0],
        [mapHeight, mapWidth],
      ];

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = Leaflet.map(mapContainerRef.current, {
        crs: Leaflet.CRS.Simple,
        minZoom: -0.4,
        maxZoom: 3,
        zoomSnap: 0.1,
        zoomDelta: 0.4,
        attributionControl: false,
        zoomControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
      });

      Leaflet.imageOverlay("/hull-fair/map-base.webp", bounds).addTo(map);
      map.setView([660, 660], 0);

      // Map click handler to place active attraction
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        // Convert to percentage coordinates:
        // lat = 1000 * (1 - y / 100) -> y = (1 - lat / 1000) * 100
        // lng = 1429.2 * (x / 100) -> x = (lng / 1429.2) * 100
        const x_pct = Math.round((lng / 1429.2) * 10000) / 100;
        const y_pct = Math.round((1 - lat / 1000) * 10000) / 100;

        // Clamp inside 0..100
        const clampedX = Math.max(0, Math.min(100, x_pct));
        const clampedY = Math.max(0, Math.min(100, y_pct));

        setPois((prev) => {
          const index = prev.findIndex((p) => p.id === activePoiId);
          if (index === -1) return prev;
          const updated = [...prev];
          updated[index] = { ...updated[index], x: clampedX, y: clampedY };
          // Save to local storage immediately
          try {
            localStorage.setItem("hull_fair_custom_pois", JSON.stringify(updated));
          } catch {}
          return updated;
        });

        toast.success(`Position set for ${activePoi?.name || "attraction"} (${clampedX}%, ${clampedY}%)`);

        // If auto-advance, move to next item in the filtered list
        if (autoAdvance) {
          const currentIndex = filteredPois.findIndex((p) => p.id === activePoiId);
          if (currentIndex !== -1 && currentIndex + 1 < filteredPois.length) {
            setActivePoiId(filteredPois[currentIndex + 1].id);
          }
        }
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
    });

    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activePoiId, autoAdvance, filteredPois, activePoi?.name]);

  // Sync Leaflet markers & make them draggable
  useEffect(() => {
    const map = mapInstanceRef.current;
    const Leaflet = leafletModuleRef.current;
    if (!map || !Leaflet || !isMapReady) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    const mapHeight = 1000;
    const mapWidth = 1429.2;

    pois.forEach((poi) => {
      const lat = mapHeight * (1 - poi.y / 100);
      const lng = mapWidth * (poi.x / 100);
      const isActive = poi.id === activePoiId;

      const categoryColorHex: Record<string, string> = {
        rollercoaster: "#f59e0b",
        thrill: "#06b6d4",
        family: "#10b981",
        funhouse: "#ec4899",
        ghost_train: "#8b5cf6",
        kids: "#f43f5e",
        food_games: "#f97316",
        wc: "#475569",
        accessible: "#2563eb",
      };

      const accentColor = categoryColorHex[poi.category] || "#e11d48";
      const iconUrl = `/hull-fair/icons/${poi.iconKey}.webp`;

      const markerHtml = `
        <div class="group relative flex flex-col items-center cursor-move transition-transform duration-150 ${
          isActive ? "scale-140 z-50 animate-bounce-subtle" : "hover:scale-120 z-10"
        }">
          <div class="relative flex items-center justify-center rounded-2xl bg-white/95 p-1 shadow-xl backdrop-blur transition-all border-2"
               style="border-color: ${accentColor}; box-shadow: 0 4px 16px ${accentColor}66;">
            <img src="${iconUrl}" alt="${poi.name}" class="h-6 w-6 object-contain" />
            ${
              isActive
                ? `<span class="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 border border-white"></span>
                  </span>`
                : ""
            }
          </div>
          <div class="pointer-events-none mt-1 whitespace-nowrap rounded bg-zinc-950 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white shadow-md ${
            isActive ? "block" : "hidden group-hover:block"
          }">
            ${poi.name}
          </div>
        </div>
      `;

      const customIcon = Leaflet.divIcon({
        html: markerHtml,
        className: "hull-fair-admin-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = Leaflet.marker([lat, lng], {
        icon: customIcon,
        draggable: true,
      })
        .addTo(map)
        .on("click", (e: any) => {
          Leaflet.DomEvent.stopPropagation(e);
          setActivePoiId(poi.id);
        })
        .on("dragend", (e: any) => {
          const newLatLng = e.target.getLatLng();
          const newX = Math.round((newLatLng.lng / 1429.2) * 10000) / 100;
          const newY = Math.round((1 - newLatLng.lat / 1000) * 10000) / 100;

          const clampedX = Math.max(0, Math.min(100, newX));
          const clampedY = Math.max(0, Math.min(100, newY));

          setPois((prev) => {
            const index = prev.findIndex((p) => p.id === poi.id);
            if (index === -1) return prev;
            const updated = [...prev];
            updated[index] = { ...updated[index], x: clampedX, y: clampedY };
            try {
              localStorage.setItem("hull_fair_custom_pois", JSON.stringify(updated));
            } catch {}
            return updated;
          });
          toast.success(`Moved ${poi.name} to (${clampedX}%, ${clampedY}%)`);
        });

      markersRef.current[poi.id] = marker;
    });
  }, [pois, activePoiId, isMapReady]);

  // Center map on active attraction
  const centerOnActive = () => {
    if (!mapInstanceRef.current || !activePoi) return;
    const mapHeight = 1000;
    const mapWidth = 1429.2;
    const lat = mapHeight * (1 - activePoi.y / 100);
    const lng = mapWidth * (activePoi.x / 100);
    mapInstanceRef.current.setView([lat, lng], 0.7, { animate: true });
  };

  // Save to DB and filesystem
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveHullFairPoisFn({ data: { pois } });
      try {
        localStorage.setItem("hull_fair_custom_pois", JSON.stringify(pois));
      } catch {}
      toast.success(`Successfully saved ${res.count} attraction positions to database & code!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save positions");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to static defaults
  const handleReset = () => {
    if (confirm("Reset all positions back to the original layout?")) {
      setPois(HULL_FAIR_POIS);
      try {
        localStorage.removeItem("hull_fair_custom_pois");
      } catch {}
      toast.info("Reset positions to default.");
    }
  };

  // Copy code
  const handleCopyCode = () => {
    const code = `export const HULL_FAIR_POIS: FairPOI[] = ${JSON.stringify(pois, null, 2)};`;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      toast.success("Copied POI TypeScript code to clipboard!");
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  // Next & previous item
  const handlePrev = () => {
    const idx = filteredPois.findIndex((p) => p.id === activePoiId);
    if (idx > 0) setActivePoiId(filteredPois[idx - 1].id);
  };

  const handleNext = () => {
    const idx = filteredPois.findIndex((p) => p.id === activePoiId);
    if (idx < filteredPois.length - 1) setActivePoiId(filteredPois[idx + 1].id);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-950 text-white overflow-hidden">
      {/* TOP HEADER & ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-amber-400 text-zinc-950">
            <Crosshair className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              Hull Fair Map Calibration Tool
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                106 Attractions
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Select any attraction from the list, then click or drag anywhere on the map to set its exact coordinate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto advance toggle */}
          <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700/60 cursor-pointer hover:bg-zinc-800">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="rounded text-amber-500 focus:ring-0"
            />
            <span>Auto-next on click</span>
          </label>

          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-semibold transition-colors"
          >
            {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy Code</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save Positions"}</span>
          </button>

          <a
            href="/hull-fair-map"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-semibold text-amber-400 transition-colors"
          >
            <span>Live Map</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* ACTIVE ATTRACTION BANNER */}
      {activePoi && (
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-amber-400 text-zinc-950 font-mono text-xs shadow-md">
          <div className="flex items-center gap-3">
            <span className="font-bold uppercase tracking-wider bg-zinc-950 text-white px-2 py-0.5 rounded text-[10px]">
              Active
            </span>
            <span className="font-bold text-sm">{activePoi.name}</span>
            <span className="text-zinc-800">({activePoi.operator})</span>
            <span className="bg-amber-500/50 px-2 py-0.5 rounded text-[11px] font-bold">
              X: {activePoi.x}% · Y: {activePoi.y}%
            </span>
          </div>

          <div className="flex items-center gap-2 font-sans font-bold">
            <span className="text-zinc-900 text-xs hidden sm:inline">
              👉 Click anywhere on map to reposition
            </span>
            <button
              type="button"
              onClick={centerOnActive}
              className="bg-zinc-950 text-white px-2.5 py-1 rounded text-xs hover:bg-zinc-850 transition-colors"
            >
              Center Pin
            </button>
            <button
              type="button"
              onClick={handlePrev}
              className="bg-zinc-950 text-white p-1 rounded hover:bg-zinc-850"
              title="Previous"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="bg-zinc-950 text-white p-1 rounded hover:bg-zinc-850"
              title="Next"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR: ATTRACTIONS LIST */}
        <div className="w-80 md:w-96 flex flex-col bg-zinc-900 border-r border-zinc-800 shrink-0">
          {/* Search & Category Filter */}
          <div className="p-3 border-b border-zinc-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attractions..."
                className="w-full bg-zinc-950 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-800 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
              {FAIR_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono whitespace-nowrap transition-colors ${
                    selectedCategory === cat.key
                      ? "bg-amber-400 text-zinc-950 font-bold"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 p-1">
            {filteredPois.map((p, idx) => {
              const isActive = p.id === activePoiId;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePoiId(p.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? "bg-amber-400/15 border border-amber-400/40 text-white"
                      : "hover:bg-zinc-850 text-zinc-300"
                  }`}
                >
                  <span className="font-mono text-[10px] text-zinc-500 w-5 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-zinc-800 p-1 shrink-0 flex items-center justify-center border border-zinc-700">
                    <img
                      src={`/hull-fair/icons/${p.iconKey}.webp`}
                      alt={p.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate">{p.name}</h4>
                    <p className="text-[10px] text-zinc-500 truncate">{p.operator}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-amber-400/90">
                      <span>X: {p.x}%</span>
                      <span>Y: {p.y}%</span>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-mono text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-400/20">
                      ACTIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MAP CANVAS */}
        <div className="flex-1 relative bg-zinc-950 overflow-hidden cursor-crosshair">
          <div ref={mapContainerRef} className="w-full h-full bg-[#1b2318]" />

          {/* Map floating hint */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-xl bg-zinc-950/90 backdrop-blur px-3 py-2 text-xs font-mono text-zinc-300 border border-zinc-800 shadow-xl">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Click to place active ride · Drag pin to fine-tune · Scroll/pinch to zoom</span>
          </div>

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn(0.5)}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-700 shadow-md transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut(0.5)}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-700 shadow-md transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
