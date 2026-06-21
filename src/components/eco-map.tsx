"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui";

interface Poi {
  name: string;
  type: string;
  emoji: string;
  // offset in degrees from the user's location, so markers are always nearby
  dLat: number;
  dLng: number;
}

// Representative nearby points of interest, placed relative to the user.
const POIS: Poi[] = [
  { name: "City Recycling Centre", type: "Recycling", emoji: "♻️", dLat: 0.008, dLng: 0.006 },
  { name: "GreenCharge EV Station", type: "EV Charging", emoji: "🔌", dLat: -0.006, dLng: 0.009 },
  { name: "Central Metro Station", type: "Public Transport", emoji: "🚇", dLat: 0.004, dLng: -0.008 },
  { name: "Riverside Tree Plantation", type: "Green Space", emoji: "🌳", dLat: -0.009, dLng: -0.005 },
  { name: "Community Compost Hub", type: "Recycling", emoji: "🍂", dLat: 0.011, dLng: -0.002 },
  { name: "Solar Co-op Office", type: "Renewable", emoji: "☀️", dLat: -0.003, dLng: 0.012 },
];

const DEFAULT: [number, number] = [13.0827, 80.2707]; // Chennai fallback

export function EcoMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Locating you…");

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    async function init(center: [number, number], located: boolean) {
      if (cancelled || !ref.current) return;
      const L = (await import("leaflet")).default;
      // Inject Leaflet CSS once.
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      map = L.map(ref.current).setView(center, 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const icon = (emoji: string) =>
        L.divIcon({
          html: `<div style="font-size:24px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">${emoji}</div>`,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

      L.marker(center, { icon: icon("📍") }).addTo(map).bindPopup("<b>You are here</b>");
      for (const p of POIS) {
        L.marker([center[0] + p.dLat, center[1] + p.dLng], { icon: icon(p.emoji) })
          .addTo(map)
          .bindPopup(`<b>${p.name}</b><br/>${p.type}`);
      }
      setStatus(located ? "Showing eco-spots near you" : "Showing sample area (location unavailable)");
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => init([pos.coords.latitude, pos.coords.longitude], true),
        () => init(DEFAULT, false),
        { timeout: 6000 },
      );
    } else {
      init(DEFAULT, false);
    }

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="overflow-hidden lg:col-span-2">
        <div ref={ref} className="h-[460px] w-full" role="application" aria-label="Eco map" />
        <p className="p-3 text-xs text-muted-foreground">{status}</p>
      </Card>
      <Card className="p-5">
        <h3 className="font-semibold">Nearby eco-spots</h3>
        <ul className="mt-3 space-y-2">
          {POIS.map((p) => (
            <li key={p.name} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <span className="text-xl">{p.emoji}</span>
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.type}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
