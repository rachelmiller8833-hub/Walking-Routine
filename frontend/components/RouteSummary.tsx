"use client";

import { MapPin, Ruler, Clock, Navigation } from "lucide-react";
import type { RouteResult } from "@/lib/types";

interface RouteSummaryProps {
  route: RouteResult;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export default function RouteSummary({ route }: RouteSummaryProps) {
  const accuracy =
    ((1 - Math.abs(route.distance_km_actual - route.distance_km_requested) / route.distance_km_requested) * 100).toFixed(0);

  return (
    <div className="rounded-xl bg-gradient-to-br from-[#1a1d2e] to-[#13151f] border border-white/10 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Navigation size={15} className="text-amber-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
          Route Ready
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={<Ruler size={14} />}
          label="Requested"
          value={`${route.distance_km_requested} km`}
        />
        <Stat
          icon={<Ruler size={14} />}
          label="Actual"
          value={`${route.distance_km_actual} km`}
          highlight
        />
        <Stat
          icon={<Clock size={14} />}
          label="Duration"
          value={formatDuration(route.estimated_duration_min)}
        />
        <Stat
          icon={<MapPin size={14} />}
          label="Accuracy"
          value={`${accuracy}%`}
        />
      </div>

      <div className="text-[11px] text-white/40 text-center pt-1">
        Loop starts &amp; ends at the same point
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <div className="flex items-center gap-1.5 text-white/40 mb-0.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p
        className={`text-sm font-semibold ${
          highlight ? "text-amber-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
