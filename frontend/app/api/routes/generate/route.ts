import { NextRequest, NextResponse } from "next/server";
import { NEIGHBORHOOD_MAP } from "@/lib/neighborhoods";
import { generateRoute } from "@/lib/routeGenerator";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { neighborhood?: string; distance_km?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const { neighborhood, distance_km } = body;

  if (!neighborhood || !NEIGHBORHOOD_MAP.has(neighborhood)) {
    return NextResponse.json({ detail: "Unknown neighborhood" }, { status: 400 });
  }
  if (typeof distance_km !== "number" || distance_km < 1 || distance_km > 20) {
    return NextResponse.json(
      { detail: "distance_km must be between 1 and 20" },
      { status: 400 },
    );
  }

  const meta = NEIGHBORHOOD_MAP.get(neighborhood)!;

  try {
    const result = await generateRoute(meta.lat, meta.lng, distance_km);
    return NextResponse.json({
      route_id: randomUUID(),
      neighborhood,
      neighborhood_label: meta.label,
      ...result,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Route generation failed";
    return NextResponse.json({ detail: msg }, { status: 502 });
  }
}
