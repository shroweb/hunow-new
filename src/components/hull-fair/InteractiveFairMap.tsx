import { useState, useEffect, useRef, useMemo } from "react";
import {
  FairPOI,
  FairCategory,
  FAIR_CATEGORIES,
  SCHEMATIC_LEGEND_ITEMS,
  HULL_FAIR_POIS,
} from "@/data/hull-fair-map-data";
import {
  Search,
  X,
  Compass,
  List,
  MapPin,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Share2,
  Sparkles,
  Info,
  Check,
  Plus,
  Minus,
  Lock,
  Unlock,
  Layers,
} from "lucide-react";

interface InteractiveFairMapProps {
  initialCategory?: FairCategory;
  initialSelectedId?: string;
  className?: string;
}

export function InteractiveFairMap({
  initialCategory = "all",
  initialSelectedId,
  className = "",
}: InteractiveFairMapProps) {
  // Always use canonical HULL_FAIR_POIS on user-facing map
  const [poisList, setPoisList] = useState<FairPOI[]>(HULL_FAIR_POIS);

  const [selectedCategory, setSelectedCategory] = useState<FairCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPOI, setSelectedPOI] = useState<FairPOI | null>(() => {
    if (initialSelectedId) {
      return poisList.find((p) => p.id === initialSelectedId) || null;
    }
    return null;
  });
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(-0.15);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const leafletModuleRef = useRef<any>(null);

  const DESKTOP_ZOOM = -0.15;
  const DESKTOP_CENTER: [number, number] = [660, 660];
  // Fairground + north Walton Street in map units, used to fit the overview on narrow screens
  const FAIR_BOUNDS: [[number, number], [number, number]] = [
    [380, 185],
    [985, 1060],
  ];
  // Locked overview for the current container size (recomputed on resize / rotate / fullscreen)
  const overviewRef = useRef<{ zoom: number; center: [number, number] }>({
    zoom: DESKTOP_ZOOM,
    center: DESKTOP_CENTER,
  });

  // Filtered POIs
  const filteredPOIs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return poisList.filter((poi) => {
      const matchesCat =
        selectedCategory === "all" ||
        poi.category === selectedCategory ||
        (selectedCategory === "wc" && poi.category === "accessible");

      if (!matchesCat) return false;

      if (!q) return true;
      return (
        poi.name.toLowerCase().includes(q) ||
        poi.operator.toLowerCase().includes(q) ||
        poi.locationArea.toLowerCase().includes(q) ||
        poi.description.toLowerCase().includes(q)
      );
    });
  }, [poisList, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: poisList.length };
    for (const cat of FAIR_CATEGORIES) {
      if (cat.key === "all") continue;
      counts[cat.key] = poisList.filter(
        (p) =>
          p.category === cat.key ||
          (cat.key === "wc" && p.category === "accessible")
      ).length;
    }
    return counts;
  }, [poisList]);

  // Inject Leaflet CSS
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

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let destroyed = false;
    let resizeObserver: ResizeObserver | null = null;

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
        minZoom: -3,
        maxZoom: 2.5,
        zoomSnap: 0.1,
        zoomDelta: 0.4,
        attributionControl: false,
        zoomControl: false,
        // STRICT BOUNDS: never let map pan off screen
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
      });

      Leaflet.imageOverlay("/hull-fair/map-base.webp", bounds).addTo(map);

      // Overview: desktop framing, or zoomed out further so the whole fairground fits a phone screen
      const applyOverview = (resetView: boolean) => {
        map.invalidateSize();
        const fitZoom = map.getBoundsZoom(FAIR_BOUNDS, false);
        const fits = fitZoom >= DESKTOP_ZOOM;
        overviewRef.current = fits
          ? { zoom: DESKTOP_ZOOM, center: DESKTOP_CENTER }
          : {
              zoom: fitZoom,
              center: [
                (FAIR_BOUNDS[0][0] + FAIR_BOUNDS[1][0]) / 2,
                (FAIR_BOUNDS[0][1] + FAIR_BOUNDS[1][1]) / 2,
              ],
            };
        map.setMinZoom(overviewRef.current.zoom - 0.15);
        if (resetView || map.getZoom() <= overviewRef.current.zoom + 0.15) {
          map.setView(overviewRef.current.center, overviewRef.current.zoom, { animate: false });
        }
      };
      applyOverview(true);

      if (typeof ResizeObserver !== "undefined") {
        let lastSize = map.getSize();
        resizeObserver = new ResizeObserver(() => {
          const el = mapContainerRef.current;
          if (!el || (el.clientWidth === lastSize.x && el.clientHeight === lastSize.y)) return;
          applyOverview(false);
          lastSize = map.getSize();
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      // REQUIREMENT 1: Lock dragging when zoomed out so map doesn't drift
      map.dragging.disable();
      setIsZoomedIn(false);

      // Update dragging state when zoom changes
      map.on("zoomend", () => {
        const currentZoom = map.getZoom();
        const overview = overviewRef.current;
        if (currentZoom > overview.zoom + 0.15) {
          map.dragging.enable();
          setIsZoomedIn(true);
        } else {
          map.dragging.disable();
          setIsZoomedIn(false);
          map.setView(overview.center, overview.zoom);
        }
        setZoomLevel(currentZoom);
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
    });

    return () => {
      destroyed = true;
      resizeObserver?.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const Leaflet = leafletModuleRef.current;
    if (!map || !Leaflet || !isMapReady) return;

    // Clear existing markers
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

    const currentZoom = map.getZoom();
    // Size badges by absolute zoom so phones (which start further out) get smaller pins in the overview
    const isCloseUp = currentZoom > DESKTOP_ZOOM + 0.6;
    const isMidZoom = currentZoom > DESKTOP_ZOOM + 0.2;
    const isFarOut = currentZoom < DESKTOP_ZOOM - 0.5;
    const badgeSize = isCloseUp ? 38 : isMidZoom ? 30 : isFarOut ? 18 : 25;
    const iconImgSize = isCloseUp ? 24 : isMidZoom ? 19 : isFarOut ? 11 : 15;
    const roundedClass = isCloseUp ? "rounded-xl" : "rounded-lg";

    filteredPOIs.forEach((poi) => {
      const lat = mapHeight * (1 - poi.y / 100);
      const lng = mapWidth * (poi.x / 100);
      const isSelected = selectedPOI?.id === poi.id;
      const accentColor = categoryColorHex[poi.category] || "#fc2c30";
      const iconUrl = `/hull-fair/icons/${poi.iconKey}.webp`;

      const markerHtml = `
        <div class="group relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${
          isSelected ? "scale-125 z-50 animate-bounce-subtle" : "hover:scale-125 z-10"
        }">
          <div class="relative flex items-center justify-center ${roundedClass} bg-white shadow-md backdrop-blur transition-all duration-200"
               style="width: ${badgeSize}px; height: ${badgeSize}px; border: 2px solid ${accentColor}; box-shadow: 0 2px 8px ${accentColor}44;">
            <img src="${iconUrl}" alt="${poi.name}" style="width: ${iconImgSize}px; height: ${iconImgSize}px;" class="object-contain drop-shadow" />
            ${
              isSelected
                ? `<span class="absolute -top-1 -right-1 flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                  </span>`
                : ""
            }
          </div>
          <div class="pointer-events-none mt-1 hidden whitespace-nowrap rounded-md bg-zinc-950/95 px-2 py-0.5 text-[10px] font-bold tracking-tight text-white shadow-xl md:group-hover:block transition-opacity"
               style="border-bottom: 2px solid ${accentColor};">
            ${poi.name}
          </div>
        </div>
      `;

      const customIcon = Leaflet.divIcon({
        html: markerHtml,
        className: "hull-fair-marker",
        iconSize: [badgeSize, badgeSize],
        iconAnchor: [badgeSize / 2, badgeSize / 2],
      });

      const marker = Leaflet.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 5000 : 0,
      })
        .addTo(map)
        .on("mouseover", () => {
          marker.setZIndexOffset(10000);
        })
        .on("mouseout", () => {
          marker.setZIndexOffset(isSelected ? 5000 : 0);
        })
        .on("click", () => {
          setSelectedPOI(poi);
          // If zoomed out, zoom in towards the tapped marker
          if (map.getZoom() <= overviewRef.current.zoom + 0.15) {
            map.setView([lat, lng], 0.7, { animate: true, duration: 0.5 });
          } else {
            map.panTo([lat, lng], { animate: true, duration: 0.4 });
          }
        });

      markersRef.current[poi.id] = marker;
    });
  }, [filteredPOIs, selectedPOI, isMapReady, isZoomedIn, zoomLevel]);

  // Select POI
  const handleSelectPOI = (poi: FairPOI) => {
    setSelectedPOI(poi);
    setViewMode("map");

    if (mapInstanceRef.current) {
      const mapHeight = 1000;
      const mapWidth = 1429.2;
      const lat = mapHeight * (1 - poi.y / 100);
      const lng = mapWidth * (poi.x / 100);
      mapInstanceRef.current.setView([lat, lng], 0.8, {
        animate: true,
        duration: 0.6,
      });
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn(0.5);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut(0.5);
    }
  };

  // Reset to locked overview
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(overviewRef.current.center, overviewRef.current.zoom, {
        animate: true,
        duration: 0.5,
      });
      setSelectedPOI(null);
    }
  };

  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + window.location.pathname);
    if (selectedPOI) {
      url.searchParams.set("poi", selectedPOI.id);
    }
    const shareUrl = url.toString();
    const title = selectedPOI ? `${selectedPOI.name} — Hull Fair 2026 Map` : "Hull Fair 2026 Map";

    // Native share sheet on touch devices
    const isTouch = window.matchMedia?.("(pointer: coarse)").matches;
    if (isTouch && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    let copied = false;
    try {
      await navigator.clipboard.writeText(shareUrl);
      copied = true;
    } catch {
      // Clipboard API unavailable (e.g. inside fullscreen or insecure context)
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      (document.fullscreenElement || document.body).appendChild(ta);
      ta.select();
      try {
        copied = document.execCommand("copy");
      } catch {}
      ta.remove();
    }

    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      window.prompt("Copy this link to share:", shareUrl);
    }
  };

  // Open a shared ?poi=<id> link on the linked attraction
  const sharedPoiHandledRef = useRef(false);
  useEffect(() => {
    if (!isMapReady || sharedPoiHandledRef.current) return;
    sharedPoiHandledRef.current = true;
    const sharedId = new URLSearchParams(window.location.search).get("poi");
    const poi = sharedId ? poisList.find((p) => p.id === sharedId) : null;
    if (poi) handleSelectPOI(poi);
  }, [isMapReady]);

  return (
    <div
      ref={mapWrapperRef}
      className={`relative flex flex-col w-full bg-zinc-950 text-white rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[750px] md:h-[820px]"
      } ${className}`}
    >
      {/* TOP CONTROLS BAR */}
      <div className="z-30 flex flex-col gap-2.5 bg-zinc-950/95 backdrop-blur-md px-3 pt-3 pb-2 border-b border-zinc-800/80">
        {/* Row 1: Title, View Switcher & Action buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs md:text-sm font-mono uppercase tracking-widest text-zinc-300 font-bold">
              Hull Fair 2026 Map
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {filteredPOIs.length} POIs
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === "map"
                    ? "bg-amber-500 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Map</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-amber-500 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>List</span>
              </button>
            </div>

            {/* Legend Toggle Button */}
            <button
              type="button"
              onClick={() => setShowLegend((v) => !v)}
              title={showLegend ? "Hide Legend" : "Show Legend"}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                showLegend
                  ? "bg-amber-400 text-zinc-950 border-amber-400 font-bold"
                  : "bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Legend</span>
            </button>

            {/* Recenter Button */}
            <button
              type="button"
              onClick={handleResetView}
              title="Reset View / Overview"
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 transition-colors"
            >
              <Compass className="h-4 w-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rides, waltzers, food, toilets, operators..."
            className="w-full rounded-xl bg-zinc-900/90 pl-9 pr-8 py-2 text-xs md:text-sm text-white placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Row 3: Horizontal Filter Pills with exact category colors */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {FAIR_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.key] || 0;
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                style={
                  isActive && cat.key !== "all"
                    ? {
                        backgroundColor: cat.hexColor,
                        color: cat.textColor,
                        borderColor: "#ffffff",
                        boxShadow: `0 2px 10px ${cat.hexColor}66`,
                      }
                    : isActive && cat.key === "all"
                    ? {
                        backgroundColor: "#f59e0b",
                        color: "#09090b",
                      }
                    : {}
                }
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full font-bold transition-all text-[11px] md:text-xs shrink-0 border ${
                  isActive
                    ? "scale-102 border-white/60 shadow-md"
                    : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-zinc-800/80"
                }`}
              >
                <span>{cat.iconEmoji}</span>
                <span>{cat.shortLabel}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-black/20 text-current"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEWPORT AREA: MAP OR LIST */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#88c474]/20">
        {/* MAP VIEW */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-200 ${
            viewMode === "map" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
          }`}
        >
          <div ref={mapContainerRef} className="relative z-0 w-full h-full bg-[#1b2318]" />

          {/* Floating Map Status Indicator */}
          <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-2 rounded-xl bg-zinc-950/85 backdrop-blur px-3 py-1.5 text-[11px] font-mono text-zinc-300 border border-zinc-800 shadow-md">
            {isZoomedIn ? (
              <>
                <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Zoomed In · Pan enabled</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Locked · Zoom in to pan</span>
              </>
            )}
          </div>

          {/* Dedicated Zoom Controls */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 shadow-lg">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 text-white border border-zinc-800 shadow-md active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 text-white border border-zinc-800 shadow-md active:scale-95 transition-all"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>

          {/* FLOATING COLOR GROUPING LEGEND CARD */}
          {showLegend && (
            <div className="absolute bottom-3 right-3 sm:bottom-auto sm:top-3 sm:right-14 z-20 w-[196px] sm:w-auto sm:max-w-[320px] rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-zinc-700/80 p-2 sm:p-3 shadow-2xl transition-all">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-white">
                    Map Colour Legend
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLegend(false)}
                  className="text-zinc-400 hover:text-white p-0.5 rounded"
                  title="Close legend"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 2-Column Capsule Pills */}
              <div className="grid grid-cols-2 gap-1.5">
                {SCHEMATIC_LEGEND_ITEMS.map((item) => {
                  const isSelected = selectedCategory === item.key;
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
                        boxShadow: isSelected
                          ? `0 0 0 2px #ffffff, 0 3px 10px ${item.color}88`
                          : "0 2px 5px rgba(0,0,0,0.3)",
                      }}
                      className={`flex items-center justify-center px-1 sm:px-2 py-1 sm:py-1.5 rounded-full border border-white font-black text-[8px] sm:text-[10px] tracking-wide transition-all transform hover:scale-103 active:scale-95 text-center drop-shadow ${
                        isSelected ? "scale-105 ring-2 ring-white" : "opacity-95 hover:opacity-100"
                      }`}
                    >
                      <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] leading-tight">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 pt-2 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-400">
                <span>Tap pill to filter</span>
                {selectedCategory !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    Reset (Show All)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <div className="relative z-20 w-full h-full overflow-y-auto bg-zinc-950 p-3 md:p-5">
            {filteredPOIs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-zinc-400 text-sm">No attractions found matching "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-3 text-xs font-mono uppercase text-amber-400 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-24">
                {filteredPOIs.map((poi) => (
                  <div
                    key={poi.id}
                    onClick={() => handleSelectPOI(poi)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800/80 hover:border-amber-400/40 cursor-pointer transition-all group"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700/60 p-1.5">
                      <img
                        src={`/hull-fair/icons/${poi.iconKey}.webp`}
                        alt={poi.name}
                        className="h-full w-full object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-amber-400">
                          {poi.category.replace("_", " ")}
                        </span>
                        {poi.heightMin && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            {poi.heightMin}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate mt-0.5">
                        {poi.name}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                        {poi.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 font-mono">
                        <span className="truncate">{poi.locationArea}</span>
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold shrink-0">
                          Map <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SELECTED POI BOTTOM SHEET */}
        {selectedPOI && viewMode === "map" && (
          <div className="absolute bottom-3 left-3 right-3 md:left-auto md:right-4 md:bottom-4 md:w-96 z-30 transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 p-4 shadow-2xl">
              <div className="flex items-start gap-3.5">
                <div className="relative flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 p-2 shadow-inner">
                  <img
                    src={`/hull-fair/icons/${selectedPOI.iconKey}.webp`}
                    alt={selectedPOI.name}
                    className="h-full w-full object-contain drop-shadow"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                      {selectedPOI.category.replace("_", " ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPOI(null)}
                      className="text-zinc-500 hover:text-white p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-white truncate mt-1">
                    {selectedPOI.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {selectedPOI.operator}
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 mt-3 leading-relaxed">
                {selectedPOI.description}
              </p>

              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="truncate">{selectedPOI.locationArea}</span>
                </div>
                {selectedPOI.heightMin && (
                  <span className="font-mono text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded">
                    {selectedPOI.heightMin}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Share</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPOI(selectedPOI)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-zinc-950 transition-colors shadow-md"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Center On Ride</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK STATS FOOTER BAR */}
      <div className="z-20 flex items-center justify-between px-3 py-2 bg-zinc-950 border-t border-zinc-900 text-[11px] font-mono text-zinc-400">
        <span className="hidden sm:inline">Walton Street Fairground · 9–17 October 2026</span>
        <span className="sm:hidden">Hull Fair 2026</span>
        <div className="flex items-center gap-3">
          <span>{filteredPOIs.length} attractions</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-bold">Free Admission</span>
        </div>
      </div>
    </div>
  );
}
