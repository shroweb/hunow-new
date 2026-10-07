import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  FairPOI,
  FairCategory,
  FAIR_CATEGORIES,
  SCHEMATIC_LEGEND_ITEMS,
  HULL_FAIR_POIS,
} from "@/data/hull-fair-map-data";
import { saveHullFairPoisFn, getHullFairPoisFn } from "@/lib/hull-fair-map.functions";
import {
  Search,
  Save,
  RotateCcw,
  Copy,
  ExternalLink,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Crosshair,
  Plus,
  Minus,
  Download,
  Loader2,
  Layers,
  X,
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Refs to avoid tearing down map when state updates
  const activePoiIdRef = useRef<string>(activePoiId);
  activePoiIdRef.current = activePoiId;

  const autoAdvanceRef = useRef<boolean>(autoAdvance);
  autoAdvanceRef.current = autoAdvance;

  const poisRef = useRef<FairPOI[]>(pois);
  poisRef.current = pois;

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

  const filteredPoisRef = useRef<FairPOI[]>(filteredPois);
  filteredPoisRef.current = filteredPois;

  // Load latest from server DB on mount
  useEffect(() => {
    getHullFairPoisFn()
      .then((res) => {
        if (res?.pois && res.pois.length > 0) {
          setPois(res.pois);
        }
      })
      .catch((err) => {
        console.warn("Could not load from DB, using local data:", err);
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

  // INITIALIZE LEAFLET MAP ONCE
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

      // Single click listener on map that reads from refs
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        const x_pct = Math.round((lng / 1429.2) * 10000) / 100;
        const y_pct = Math.round((1 - lat / 1000) * 10000) / 100;

        const clampedX = Math.max(0, Math.min(100, x_pct));
        const clampedY = Math.max(0, Math.min(100, y_pct));

        const currentActiveId = activePoiIdRef.current;
        if (!currentActiveId) return;

        setPois((prev) => {
          const index = prev.findIndex((p) => p.id === currentActiveId);
          if (index === -1) return prev;
          const updated = [...prev];
          const poiName = updated[index].name;
          updated[index] = { ...updated[index], x: clampedX, y: clampedY };
          try {
            localStorage.setItem("hull_fair_custom_pois", JSON.stringify(updated));
          } catch {}
          toast.success(`Position set for ${poiName} (${clampedX}%, ${clampedY}%)`);
          return updated;
        });

        // If auto-advance, move to next item in the filtered list
        if (autoAdvanceRef.current) {
          const currentList = filteredPoisRef.current;
          const currentIndex = currentList.findIndex((p) => p.id === currentActiveId);
          if (currentIndex !== -1 && currentIndex + 1 < currentList.length) {
            setActivePoiId(currentList[currentIndex + 1].id);
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
  }, []);

  // SYNC LEAFLET MARKERS (WITHOUT TEARING DOWN MAP)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const Leaflet = leafletModuleRef.current;
    if (!map || !Leaflet || !isMapReady) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    const mapHeight = 1000;
    const mapWidth = 1429.2;

    const categoryColorHex: Record<string, string> = {
      rollercoaster: "#fcdc5c",
      thrill: "#38b4fc",
      family: "#78d858",
      funhouse: "#c868e4",
      ghost_train: "#8c4cfc",
      kids: "#fc2c30",
      food_games: "#fc904f",
      wc: "#545454",
      accessible: "#545454",
    };

    pois.forEach((poi) => {
      const lat = mapHeight * (1 - poi.y / 100);
      const lng = mapWidth * (poi.x / 100);
      const isActive = poi.id === activePoiId;

      const accentColor = categoryColorHex[poi.category] || "#fc2c30";
      const iconUrl = `/hull-fair/icons/${poi.iconKey}.webp`;

      const markerHtml = `
        <div class="group relative flex flex-col items-center cursor-move transition-transform duration-150 ${
          isActive ? "scale-140 z-50 animate-bounce-subtle" : "hover:scale-120 z-10"
        }">
          <div class="relative flex items-center justify-center rounded-2xl bg-white p-1 shadow-2xl backdrop-blur transition-all"
               style="border: 2.5px solid ${accentColor}; box-shadow: 0 4px 16px ${accentColor}88;">
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
            isActive ? "block ring-1 ring-amber-400" : "hidden group-hover:block"
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
        zIndexOffset: isActive ? 5000 : 0,
      })
        .addTo(map)
        .on("mouseover", () => {
          marker.setZIndexOffset(10000);
        })
        .on("mouseout", () => {
          marker.setZIndexOffset(isActive ? 5000 : 0);
        })
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
  const centerOnActive = useCallback(() => {
    if (!mapInstanceRef.current || !activePoi) return;
    const mapHeight = 1000;
    const mapWidth = 1429.2;
    const lat = mapHeight * (1 - activePoi.y / 100);
    const lng = mapWidth * (activePoi.x / 100);
    mapInstanceRef.current.setView([lat, lng], 0.7, { animate: true });
  }, [activePoi]);

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

  // DOWNLOAD FULL RESOLUTION PNG WITH RENDERED ICONS
  const handleDownloadPng = async () => {
    setIsDownloading(true);
    toast.info("Generating high-resolution PNG map with all icons...");

    try {
      const baseImg = new window.Image();
      baseImg.crossOrigin = "anonymous";
      baseImg.src = "/hull-fair/map-base.webp";

      await new Promise((resolve, reject) => {
        baseImg.onload = resolve;
        baseImg.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = baseImg.naturalWidth || 3200;
      canvas.height = baseImg.naturalHeight || 2239;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      // Draw base cartoon map
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      // Preload all unique icons
      const uniqueIcons = Array.from(new Set(pois.map((p) => p.iconKey)));
      const iconImages: Record<string, HTMLImageElement> = {};

      await Promise.all(
        uniqueIcons.map(
          (key) =>
            new Promise<void>((resolve) => {
              const iconImg = new window.Image();
              iconImg.crossOrigin = "anonymous";
              iconImg.src = `/hull-fair/icons/${key}.png`;
              iconImg.onload = () => {
                iconImages[key] = iconImg;
                resolve();
              };
              iconImg.onerror = () => resolve();
            })
        )
      );

      // Category color mapping for canvas
      const categoryColorHex: Record<string, string> = {
        rollercoaster: "#fcdc5c",
        thrill: "#38b4fc",
        family: "#78d858",
        funhouse: "#c868e4",
        ghost_train: "#8c4cfc",
        kids: "#fc2c30",
        food_games: "#fc904f",
        wc: "#545454",
        accessible: "#545454",
      };

      // Draw each POI badge and icon on the canvas with color-coded ring
      const iconSize = 60;
      for (const p of pois) {
        const px = (p.x / 100) * canvas.width;
        const py = (p.y / 100) * canvas.height;
        const iconImg = iconImages[p.iconKey];
        const ringColor = categoryColorHex[p.category] || "#fc2c30";

        // Draw glowing white badge circle behind each icon
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, iconSize / 2 + 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
        ctx.shadowColor = ringColor;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        ctx.fill();

        // Category color ring
        ctx.lineWidth = 4;
        ctx.strokeStyle = ringColor;
        ctx.stroke();
        ctx.restore();

        // Draw icon inside badge
        if (iconImg) {
          ctx.drawImage(iconImg, px - iconSize / 2, py - iconSize / 2, iconSize, iconSize);
        }
      }

      // DRAW OFFICIAL 8-CAPSULE LEGEND ON CANVAS (TOP-RIGHT)
      const legendW = 600;
      const legendH = 330;
      const legendX = canvas.width - legendW - 60;
      const legendY = 60;

      ctx.save();
      // Legend container card
      ctx.beginPath();
      ctx.roundRect(legendX, legendY, legendW, legendH, 24);
      ctx.fillStyle = "rgba(18, 18, 22, 0.92)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
      ctx.fill();

      // Card border
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.stroke();

      // Title
      ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("HULL FAIR 2026 · OFFICIAL MAP LEGEND", legendX + 28, legendY + 44);

      // 8 capsules in 2 columns
      const legendPills = [
        { label: "THRILL RIDES", color: "#38b4fc", textColor: "#ffffff", col: 0, row: 0 },
        { label: "ROLLERCOASTERS", color: "#fcdc5c", textColor: "#18181b", col: 1, row: 0 },
        { label: "FAMILY RIDES", color: "#78d858", textColor: "#ffffff", col: 0, row: 1 },
        { label: "FUNHOUSES", color: "#c868e4", textColor: "#ffffff", col: 1, row: 1 },
        { label: "KIDS RIDES", color: "#fc2c30", textColor: "#ffffff", col: 0, row: 2 },
        { label: "GHOST TRAINS", color: "#8c4cfc", textColor: "#ffffff", col: 1, row: 2 },
        { label: "FOOD/GAMES", color: "#fc904f", textColor: "#ffffff", col: 0, row: 3 },
        { label: "WC/TOILETS", color: "#545454", textColor: "#ffffff", col: 1, row: 3 },
      ];

      const pillW = 255;
      const pillH = 48;
      const startX = legendX + 28;
      const startY = legendY + 68;
      const gapX = 30;
      const gapY = 14;

      for (const item of legendPills) {
        const px = startX + item.col * (pillW + gapX);
        const py = startY + item.row * (pillH + gapY);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(px, py, pillW, pillH, pillH / 2);
        ctx.fillStyle = item.color;
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.fill();

        // White border
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        // Text
        ctx.font = "900 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.lineWidth = 4;
        ctx.strokeStyle = "#000000";
        ctx.strokeText(item.label, px + pillW / 2, py + pillH / 2);

        ctx.fillStyle = item.textColor === "#18181b" ? "#ffffff" : item.textColor;
        ctx.fillText(item.label, px + pillW / 2, py + pillH / 2);

        ctx.restore();
      }

      ctx.restore();

      // Convert canvas to downloadable PNG
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to generate PNG blob");
          setIsDownloading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hull-fair-2026-map-${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Downloaded high-resolution map PNG!");
        setIsDownloading(false);
      }, "image/png");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to render map image");
      setIsDownloading(false);
    }
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
                {pois.length} Attractions
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

          {/* Download PNG Button */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>{isDownloading ? "Rendering..." : "Download PNG"}</span>
          </button>

          {/* Toggle Legend on Map */}
          <button
            type="button"
            onClick={() => setShowLegend((v) => !v)}
            title={showLegend ? "Hide Legend" : "Show Legend"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              showLegend
                ? "bg-amber-400 text-zinc-950 border-amber-400 font-bold"
                : "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Legend</span>
          </button>

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
                      ? "bg-amber-400/20 border-2 border-amber-400 text-white shadow-lg"
                      : "hover:bg-zinc-850 text-zinc-300 border border-transparent"
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
                    <span className="text-[10px] font-mono text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-400/20 shrink-0">
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

          {/* FLOATING COLOR GROUPING LEGEND CARD */}
          {showLegend && (
            <div className="absolute top-4 left-4 z-20 max-w-[320px] rounded-2xl bg-zinc-950/92 backdrop-blur-md border border-zinc-750 p-3 shadow-2xl">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-white">
                  Official Schematic Legend
                </span>
                <button
                  type="button"
                  onClick={() => setShowLegend(false)}
                  className="text-zinc-400 hover:text-white p-0.5 rounded"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {SCHEMATIC_LEGEND_ITEMS.map((item) => {
                  const isFiltered = selectedCategory === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setSelectedCategory((prev) =>
                          prev === item.key ? "all" : item.key
                        )
                      }
                      style={{
                        backgroundColor: item.color,
                        color: item.textColor,
                        boxShadow: isFiltered
                          ? `0 0 0 2px #ffffff, 0 3px 10px ${item.color}88`
                          : "0 2px 5px rgba(0,0,0,0.3)",
                      }}
                      className={`flex items-center justify-center px-2 py-1.5 rounded-full border border-white font-black text-[9px] tracking-wide transition-all hover:scale-103 active:scale-95 text-center drop-shadow ${
                        isFiltered ? "scale-105 ring-2 ring-white" : ""
                      }`}
                    >
                      <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] leading-tight">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-1.5 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-400">
                <span>Click pill to filter list & pins</span>
                {selectedCategory !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
