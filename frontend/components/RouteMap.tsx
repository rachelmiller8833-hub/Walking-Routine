"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Polyline, CircleMarker } from "leaflet";
import type { LatLng, RouteResult } from "@/lib/types";

interface RouteMapProps {
  route: RouteResult | null;
  defaultCenter: LatLng;
}

export default function RouteMap({ route, defaultCenter }: RouteMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const polylineRef = useRef<Polyline | null>(null);
  const glowRef = useRef<Polyline | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);

  // Initialise the Leaflet map exactly once.
  // The `destroyed` flag handles the StrictMode async gap:
  //   - If cleanup fires before import() resolves, `destroyed` becomes true
  //     and the .then() callback bails out before calling L.map().
  // The `mapRef.current` re-check inside .then() handles the StrictMode
  //   double-invocation: both effects pass the synchronous guard, but only
  //   the first resolved .then() should create the map.
  useEffect(() => {
    let destroyed = false;

    if (!containerRef.current) return;

    import("leaflet").then((L) => {
      if (destroyed || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      destroyed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update route layers whenever `route` changes — never touches the map instance.
  useEffect(() => {
    if (!route) return;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;

      // Clear previous layers
      polylineRef.current?.remove();
      glowRef.current?.remove();
      markerRef.current?.remove();

      const latlngs = route.path.map((p) => [p.lat, p.lng] as [number, number]);

      glowRef.current = L.polyline(latlngs, {
        color: "#f59e0b",
        weight: 12,
        opacity: 0.15,
      }).addTo(map);

      polylineRef.current = L.polyline(latlngs, {
        color: "#f59e0b",
        weight: 4,
        opacity: 0.9,
        dashArray: "8 6",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      markerRef.current = L.circleMarker(
        [route.start_point.lat, route.start_point.lng],
        {
          radius: 9,
          color: "#f59e0b",
          fillColor: "#0f1117",
          fillOpacity: 1,
          weight: 3,
        }
      )
        .addTo(map)
        .bindTooltip("Start / End", {
          permanent: false,
          direction: "top",
          className: "leaflet-tooltip-custom",
        });

      map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
    });
  }, [route]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
}
