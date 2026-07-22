import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ListingCard } from "@/components/cards";
import { PaginationControls } from "@/components/PaginationControls";
import { fetchPagedListings } from "@/lib/content-read.functions";
import { openStatus } from "@/lib/hours";
import { escapeAttr } from "@/lib/sanitize";
import type { Listing } from "@/types";

const PER_PAGE = 12;

const NEAR_KEY = "hunow:near:coords:v2";

export const Route = createFileRoute("/listings")({
  loader: async () => {
    const { getTaxonomy } = await import("@/lib/taxonomy-config.functions");
    const taxonomy = await getTaxonomy();
    return {
      categories: ["All", ...(taxonomy.categories ?? [])],
      areas: ["All", ...(taxonomy.areas ?? [])],
    };
  },
  head: () => ({
    meta: [
      { title: "Business Listings — HU NOW" },
      {
        name: "description",
        content: "Browse independent businesses, shops, restaurants and venues across Hull.",
      },
    ],
    links: [{ rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" }],
  }),
  component: ListingsPage,
});

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function ListingsPage() {
  const { categories, areas } = Route.useLoaderData();
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [cat, setCat] = useState("All");
  const [area, setArea] = useState("All");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
    }, 400);
    return () => clearTimeout(timer);
  }, [q]);

  // Restore saved coords
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NEAR_KEY);
      if (saved) setUserCoords(JSON.parse(saved) as { lat: number; lng: number });
    } catch {
      /* ignore */
    }
  }, []);

  const locateMe = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setGeoLoading(false);
        try {
          localStorage.setItem(NEAR_KEY, JSON.stringify(coords));
        } catch {
          /* ignore */
        }
      },
      () => {
        setGeoError("Couldn't get your location.");
        setGeoLoading(false);
      },
      { timeout: 8000 },
    );
  };

  const clearLocation = () => {
    setUserCoords(null);
    try {
      localStorage.removeItem(NEAR_KEY);
    } catch {
      /* ignore */
    }
  };

  // Fetch listings from server
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPagedListings({
      data: {
        category: cat === "All" ? undefined : cat,
        area: area === "All" ? undefined : area,
        q: debouncedQ || undefined,
        page: view === "map" ? 1 : page,
        limit: view === "map" ? 500 : 12,
      },
    })
      .then((res) => {
        if (!active) return;
        setListings(res.items);
        setTotalCount(res.totalCount);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cat, area, debouncedQ, page, view]);

  const filtered = useMemo(() => {
    let result = listings;
    if (openNow) {
      result = result.filter((l) => openStatus(l.hours).open);
    }
    // Sort by distance when user location is known
    if (userCoords) {
      result = [...result]
        .map((l) => ({
          listing: l,
          dist:
            l.latitude != null && l.longitude != null
              ? haversineKm(userCoords.lat, userCoords.lng, l.latitude, l.longitude)
              : Infinity,
        }))
        .sort((a, b) => a.dist - b.dist)
        .map((x) => x.listing);
    }
    return result;
  }, [listings, openNow, userCoords]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [cat, area, debouncedQ, openNow, userCoords]);

  const totalPages = Math.ceil((openNow ? filtered.length : totalCount) / PER_PAGE);
  const paged = openNow
    ? filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    : filtered;

  const distanceFor = (l: Listing) => {
    if (!userCoords || l.latitude == null || l.longitude == null) return null;
    const km = haversineKm(userCoords.lat, userCoords.lng, l.latitude, l.longitude);
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  };

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-b border-border">
        <div className="text-[10px] font-mono uppercase mb-4 text-accent">The Directory</div>
        <h1 className="text-6xl md:text-8xl font-display uppercase leading-none mb-6">Listings</h1>
        <p className="text-xl max-w-2xl text-muted-foreground">
          A directory of independent businesses, venues and places worth knowing about in Hull.
        </p>
        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search businesses..."
            className="flex-1 bg-white border-2 border-foreground px-4 py-3 font-mono text-sm focus:outline-none"
          />
          <button
            onClick={userCoords ? clearLocation : locateMe}
            disabled={geoLoading}
            className={`px-6 py-3 border-2 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2 ${userCoords ? "border-accent text-accent hover:bg-accent hover:text-background" : "border-foreground hover:bg-foreground hover:text-background"}`}
          >
            <svg width="11" height="14" viewBox="0 0 11 14" fill="currentColor" aria-hidden="true">
              <path d="M5.5 0C2.46 0 0 2.46 0 5.5c0 4.125 5.5 8.5 5.5 8.5S11 9.625 11 5.5C11 2.46 8.54 0 5.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg>
            {geoLoading ? "Locating…" : userCoords ? "Near me ×" : "Near me"}
          </button>
        </div>
        {geoError && <p className="mt-2 text-xs text-red-600 font-mono">{geoError}</p>}
        {userCoords && (
          <p className="mt-2 text-[10px] font-mono uppercase text-accent">
            Sorted by distance from your location
          </p>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-5 border-b border-border">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category dropdown */}
          <div className="relative">
            <label className="sr-only" htmlFor="filter-cat">
              Category
            </label>
            <select
              id="filter-cat"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className={`appearance-none pl-3 pr-8 py-2.5 border-2 text-[11px] font-bold uppercase tracking-widest bg-background focus:outline-none cursor-pointer transition-colors ${cat !== "All" ? "border-accent text-accent" : "border-foreground/30 hover:border-foreground"}`}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "Category" : c}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px]">
              ▾
            </span>
          </div>

          {/* Area dropdown */}
          <div className="relative">
            <label className="sr-only" htmlFor="filter-area">
              Area
            </label>
            <select
              id="filter-area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className={`appearance-none pl-3 pr-8 py-2.5 border-2 text-[11px] font-bold uppercase tracking-widest bg-background focus:outline-none cursor-pointer transition-colors ${area !== "All" ? "border-accent text-accent" : "border-foreground/30 hover:border-foreground"}`}
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a === "All" ? "Area" : a}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px]">
              ▾
            </span>
          </div>

          {/* Open Now toggle */}
          <button
            onClick={() => setOpenNow((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2.5 border-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${openNow ? "border-[oklch(0.58_0.15_145)] text-[oklch(0.58_0.15_145)]" : "border-foreground/30 hover:border-foreground"}`}
          >
            <span
              className={`size-2 rounded-full ${openNow ? "bg-[oklch(0.58_0.15_145)]" : "bg-foreground/30"}`}
            />
            Open Now
          </button>

          {/* Clear filters */}
          {(cat !== "All" || area !== "All" || openNow) && (
            <button
              onClick={() => {
                setCat("All");
                setArea("All");
                setOpenNow(false);
              }}
              className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Clear
            </button>
          )}

          {/* View toggle */}
          <div className="flex gap-1 ml-auto" role="tablist" aria-label="View mode">
            <button
              role="tab"
              aria-selected={view === "list"}
              onClick={() => setView("list")}
              className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${view === "list" ? "bg-foreground text-background" : "border border-foreground/20 hover:border-foreground"}`}
            >
              List
            </button>
            <button
              role="tab"
              aria-selected={view === "map"}
              onClick={() => setView("map")}
              className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${view === "map" ? "bg-foreground text-background" : "border border-foreground/20 hover:border-foreground"}`}
            >
              Map
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-[10px] font-mono uppercase text-muted-foreground mb-6">
          {openNow ? filtered.length : totalCount} {(openNow ? filtered.length : totalCount) === 1 ? "listing" : "listings"}
        </p>
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="font-mono text-sm uppercase animate-pulse">Loading listings…</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">No listings match your filters.</p>
        ) : view === "map" ? (
          <MapView listings={filtered} userCoords={userCoords} />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {paged.map((l) => (
                <div key={l.id} className="relative">
                  {distanceFor(l) && (
                    <div className="absolute top-3 right-12 z-10 bg-foreground text-background text-[9px] font-bold uppercase px-2 py-0.5">
                      {distanceFor(l)}
                    </div>
                  )}
                  <ListingCard listing={l} />
                </div>
              ))}
            </div>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              total={openNow ? filtered.length : totalCount}
              perPage={PER_PAGE}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </>
        )}
      </section>
    </PublicLayout>
  );
}

function MapView({
  listings,
  userCoords,
}: {
  listings: Listing[];
  userCoords: { lat: number; lng: number } | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const withCoords = listings.filter((l) => l.latitude != null && l.longitude != null);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    let destroyed = false;

    import("leaflet").then((L) => {
      if (destroyed || !mapRef.current) return;

      // Fix default marker icons broken by bundlers
      // @ts-expect-error - leaflet internal
      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Hull city centre fallback
      const defaultCenter: [number, number] = [53.7446, -0.3352];

      const map = L.default.map(mapRef.current!).setView(defaultCenter, 13);
      mapInstanceRef.current = map;

      L.default
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
          maxZoom: 19,
        })
        .addTo(map);

      const bounds: [number, number][] = [];

      // User location marker
      if (userCoords) {
        const userIcon = L.default.divIcon({
          html: `<div style="width:14px;height:14px;border-radius:50%;background:oklch(0.65 0.2 45);border:3px solid white;box-shadow:0 0 0 2px oklch(0.65 0.2 45)"></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.default
          .marker([userCoords.lat, userCoords.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("You are here");
        bounds.push([userCoords.lat, userCoords.lng]);
      }

      // Listing markers
      for (const l of withCoords) {
        const marker = L.default.marker([l.latitude!, l.longitude!]).addTo(map);
        marker.bindPopup(
          `<div style="font-family:monospace;font-size:11px">
            <strong style="font-size:13px;font-family:sans-serif">${escapeAttr(l.name)}</strong><br>
            ${escapeAttr(l.category)} · ${escapeAttr(l.area)}<br>
            <a href="/places/${escapeAttr(l.slug)}" style="color:oklch(0.65 0.2 45);font-weight:bold">View listing →</a>
          </div>`,
        );
        bounds.push([l.latitude!, l.longitude!]);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    });

    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        // @ts-expect-error - leaflet map instance
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // Re-init map when listings or userCoords change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings.map((l) => l.id).join(","), userCoords?.lat, userCoords?.lng]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div
        className="md:col-span-8 border-2 border-foreground overflow-hidden"
        style={{ height: "560px" }}
      >
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        {withCoords.length < listings.length && (
          <div className="absolute bottom-0 left-0 right-0 bg-background/80 text-[9px] font-mono uppercase px-3 py-1 text-muted-foreground">
            {listings.length - withCoords.length} listing
            {listings.length - withCoords.length !== 1 ? "s" : ""} without coordinates hidden
          </div>
        )}
      </div>
      <ul
        className="md:col-span-4 divide-y divide-foreground/10 border-2 border-foreground bg-white overflow-y-auto"
        style={{ maxHeight: "560px" }}
      >
        {listings.map((l) => (
          <li key={l.id}>
            <a
              href={`/places/${l.slug}`}
              className="flex items-start justify-between gap-3 p-3 hover:bg-foreground/5"
            >
              <div className="min-w-0">
                <div className="font-bold truncate text-sm">{l.name}</div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground">
                  {l.category} · {l.area}
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase text-accent shrink-0">→</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
