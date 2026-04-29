"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Footprints,
  ChevronDown,
  Loader2,
  Sparkles,
  TriangleAlert,
  Ruler,
  Clock,
} from "lucide-react";
import { generateRoute } from "@/lib/api";
import type { Neighborhood, RouteResult } from "@/lib/types";
import RouteSummary from "@/components/RouteSummary";

const NEIGHBORHOODS: Neighborhood[] = [
  { value: "nachlaot",      label: "Nachlaot" },
  { value: "rehavia",       label: "Rehavia" },
  { value: "katamon",       label: "Katamon" },
  { value: "talbia",        label: "Talbia" },
  { value: "city_center",   label: "City Center" },
  { value: "german_colony", label: "German Colony" },
  { value: "baka",          label: "Baka" },
  { value: "ramot",         label: "Ramot" },
  { value: "pisgat_zeev",   label: "Pisgat Ze'ev" },
  { value: "neve_yaacov",   label: "Neve Ya'acov" },
  { value: "gilo",          label: "Gilo" },
  { value: "har_homa",      label: "Har Homa" },
  { value: "talpiot",       label: "Talpiot" },
  { value: "arnona",        label: "Arnona" },
  { value: "kiryat_yovel",  label: "Kiryat Yovel" },
  { value: "ein_karem",     label: "Ein Karem" },
  { value: "har_nof",       label: "Har Nof" },
  { value: "beit_hakerem",  label: "Beit HaKerem" },
  { value: "kiryat_moshe",  label: "Kiryat Moshe" },
];

// Walking speed constant shared across both modes
const KM_PER_MIN = 1 / 12; // 5 km/h → 1 km per 12 min

// Leaflet requires browser APIs – load without SSR
const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

const JERUSALEM_CENTER = { lat: 31.7683, lng: 35.2137 };

type InputMode = "distance" | "time";

export default function HomePage() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [inputMode, setInputMode] = useState<InputMode>("distance");

  // Distance mode
  const [distanceKm, setDistanceKm] = useState<string>("5");

  // Time mode
  const [durationMin, setDurationMin] = useState<string>("60");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLabel =
    NEIGHBORHOODS.find((n) => n.value === selectedNeighborhood)?.label ?? "";

  // Resolve the effective distance in km regardless of mode
  const distanceNum = parseFloat(distanceKm);
  const durationNum = parseFloat(durationMin);

  const effectiveDistanceKm =
    inputMode === "distance"
      ? distanceNum
      : Math.round(durationNum * KM_PER_MIN * 10) / 10;

  const distanceValid = !isNaN(distanceNum) && distanceNum >= 1 && distanceNum <= 20;
  const durationValid = !isNaN(durationNum) && durationNum >= 12 && durationNum <= 240;
  const inputValid = inputMode === "distance" ? distanceValid : durationValid;

  const isValid = !!selectedNeighborhood && inputValid;

  const handleGenerate = useCallback(async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateRoute({
        neighborhood: selectedNeighborhood,
        distance_km: effectiveDistanceKm,
      });
      setRoute(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [isValid, selectedNeighborhood, effectiveDistanceKm]);

  const mapCenter = route ? route.start_point : JERUSALEM_CENTER;

  return (
    <div className="flex h-screen w-screen bg-[#0d0f1a] overflow-hidden">
      {/* ─── Sidebar ─── */}
      <aside className="relative z-50 flex flex-col w-[340px] min-w-[300px] max-w-[380px] h-full bg-[#0f1117] border-r border-white/[0.06] shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-8 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Footprints size={16} className="text-amber-400" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-white">
              Walk Jerusalem
            </h1>
          </div>
          <p className="text-xs text-white/40 ml-[42px]">
            Generate a loop walking route
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Neighborhood picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Neighborhood
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all
                  bg-white/5 border ${
                    dropdownOpen
                      ? "border-amber-400/70 ring-1 ring-amber-400/30"
                      : "border-white/10 hover:border-white/20"
                  } text-left`}
              >
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-amber-400 shrink-0" />
                  <span className={selectedLabel ? "text-white" : "text-white/30"}>
                    {selectedLabel || "Choose a neighborhood"}
                  </span>
                </span>
                <ChevronDown
                  size={14}
                  className={`text-white/40 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-[#181b2a] border border-white/10 shadow-2xl z-50 overflow-hidden">
                  <div className="max-h-56 overflow-y-auto py-1">
                    {NEIGHBORHOODS.map((n) => (
                      <button
                        key={n.value}
                        type="button"
                        onClick={() => {
                          setSelectedNeighborhood(n.value);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                          ${
                            selectedNeighborhood === n.value
                              ? "bg-amber-500/20 text-amber-300"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mode toggle */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Route by
            </label>
            <div className="grid grid-cols-2 rounded-xl bg-white/5 p-1 gap-1">
              <button
                type="button"
                onClick={() => setInputMode("distance")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all
                  ${
                    inputMode === "distance"
                      ? "bg-amber-500 text-black shadow"
                      : "text-white/40 hover:text-white/70"
                  }`}
              >
                <Ruler size={12} />
                Distance
              </button>
              <button
                type="button"
                onClick={() => setInputMode("time")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all
                  ${
                    inputMode === "time"
                      ? "bg-amber-500 text-black shadow"
                      : "text-white/40 hover:text-white/70"
                  }`}
              >
                <Clock size={12} />
                Time
              </button>
            </div>
          </div>

          {/* Distance input */}
          {inputMode === "distance" && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  id="distance"
                  type="number"
                  min={1}
                  max={20}
                  step={0.5}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10
                    text-white placeholder:text-white/25 outline-none
                    focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30 transition-all
                    [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">
                  km
                </span>
              </div>
              {distanceKm && !distanceValid && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <TriangleAlert size={11} />
                  Enter a value between 1 and 20 km
                </p>
              )}
              {/* Distance presets */}
              <div className="grid grid-cols-4 gap-2">
                {[2, 5, 8, 12].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setDistanceKm(String(km))}
                    className={`rounded-lg py-1.5 text-xs font-medium transition-all
                      ${
                        distanceKm === String(km)
                          ? "bg-amber-500/25 text-amber-300 border border-amber-400/40"
                          : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/80"
                      }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time input */}
          {inputMode === "time" && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  id="duration"
                  type="number"
                  min={12}
                  max={240}
                  step={5}
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  placeholder="e.g. 60"
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10
                    text-white placeholder:text-white/25 outline-none
                    focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30 transition-all
                    [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">
                  min
                </span>
              </div>
              {durationMin && !durationValid && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <TriangleAlert size={11} />
                  Enter a value between 12 and 240 min
                </p>
              )}
              {/* Time presets */}
              <div className="grid grid-cols-4 gap-2">
                {[20, 30, 45, 60].map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setDurationMin(String(min))}
                    className={`rounded-lg py-1.5 text-xs font-medium transition-all
                      ${
                        durationMin === String(min)
                          ? "bg-amber-500/25 text-amber-300 border border-amber-400/40"
                          : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/80"
                      }`}
                  >
                    {min} m
                  </button>
                ))}
              </div>
              {/* Distance equivalent hint */}
              {durationValid && (
                <p className="text-[11px] text-white/30 text-center">
                  ≈ {effectiveDistanceKm} km at 5 km/h
                </p>
              )}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-xs text-rose-300 flex items-start gap-2">
              <TriangleAlert size={13} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Route summary */}
          {route && !loading && <RouteSummary route={route} />}
        </div>

        {/* Generate button */}
        <div className="px-6 pb-6 pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!isValid || loading}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold
              transition-all duration-200
              ${
                isValid && !loading
                  ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25 active:scale-[0.98]"
                  : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
              }`}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Create Route
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-4 text-center text-[10px] text-white/20">
          Routes powered by OpenStreetMap &amp; OSRM
        </div>
      </aside>

      {/* ─── Map area ─── */}
      <main className="flex-1 relative p-4">
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/[0.05]">
          <RouteMap route={route} defaultCenter={mapCenter} />
        </div>

        {/* Floating badge */}
        {route && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 shadow-xl">
            <MapPin size={12} className="text-amber-400" />
            <span className="text-xs font-medium text-white">
              {route.neighborhood_label}
            </span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-xs text-white/60">
              {route.distance_km_actual} km
            </span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-xs text-white/60">
              {route.estimated_duration_min} min
            </span>
          </div>
        )}
      </main>

      {/* Click-outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
}
