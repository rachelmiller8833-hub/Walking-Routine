export interface LatLng { lat: number; lng: number }

export interface RouteData {
  start_point: LatLng;
  distance_km_requested: number;
  distance_km_actual: number;
  estimated_duration_min: number;
  path: LatLng[];
  source: "osrm" | "geometric";
}

const OSRM_BASE = "http://router.project-osrm.org/route/v1/foot";
const NUM_WAYPOINTS = 8;
const GEOMETRIC_POINTS = 64;
const TOLERANCE = 0.1;
const MAX_ITER = 10;

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

function circlePoints(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  n: number,
  offsetDeg = 45,
): LatLng[] {
  const latPerKm = 1 / 111.32;
  const lngPerKm = 1 / (111.32 * Math.cos((centerLat * Math.PI) / 180));
  return Array.from({ length: n }, (_, i) => {
    const angle = ((offsetDeg + (i * 360) / n) * Math.PI) / 180;
    return {
      lat: centerLat + radiusKm * Math.sin(angle) * latPerKm,
      lng: centerLng + radiusKm * Math.cos(angle) * lngPerKm,
    };
  });
}

function geometricRoute(
  centerLat: number,
  centerLng: number,
  distanceKm: number,
): RouteData {
  const radiusKm = distanceKm / (2 * Math.PI);
  const pts = circlePoints(centerLat, centerLng, radiusKm, GEOMETRIC_POINTS);
  const path = [...pts, pts[0]];
  const actual = path
    .slice(1)
    .reduce((sum, p, i) => sum + haversineKm(path[i], p), 0);
  return {
    start_point: { lat: centerLat, lng: centerLng },
    distance_km_requested: distanceKm,
    distance_km_actual: Math.round(actual * 100) / 100,
    estimated_duration_min: Math.round(actual * 12),
    path,
    source: "geometric",
  };
}

export async function generateRoute(
  centerLat: number,
  centerLng: number,
  distanceKm: number,
): Promise<RouteData> {
  let radiusKm = distanceKm / (2 * Math.PI);

  try {
    let path: LatLng[] = [];
    let actualKm = distanceKm;

    for (let i = 0; i < MAX_ITER; i++) {
      const wps = circlePoints(centerLat, centerLng, radiusKm, NUM_WAYPOINTS);
      const loop = [...wps, wps[0]];
      const coords = loop.map((p) => `${p.lng},${p.lat}`).join(";");
      const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&steps=false`;

      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`OSRM ${res.status}`);
      const data = await res.json();
      if (data.code !== "Ok" || !data.routes?.length) throw new Error("No route");

      const route = data.routes[0];
      path = (route.geometry.coordinates as [number, number][]).map(
        ([lng, lat]) => ({ lat, lng }),
      );
      actualKm = route.distance / 1000;

      if (Math.abs(actualKm - distanceKm) / distanceKm <= TOLERANCE) break;
      radiusKm *= distanceKm / actualKm;
    }

    return {
      start_point: { lat: centerLat, lng: centerLng },
      distance_km_requested: distanceKm,
      distance_km_actual: Math.round(actualKm * 100) / 100,
      estimated_duration_min: Math.round(actualKm * 12),
      path,
      source: "osrm",
    };
  } catch {
    return geometricRoute(centerLat, centerLng, distanceKm);
  }
}
