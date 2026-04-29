import math
import httpx
from typing import List, Dict, Any, Tuple

OSRM_BASE_URL = "http://router.project-osrm.org/route/v1/foot"

# Coarse waypoints sent to OSRM for snapping
NUM_WAYPOINTS = 8
# Points in the geometric fallback circle (smooth curve, no external API)
GEOMETRIC_POINTS = 64


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return great-circle distance in km between two points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _circle_points(
    center_lat: float,
    center_lng: float,
    radius_km: float,
    n: int,
    angle_offset_deg: float = 0.0,
) -> List[Tuple[float, float]]:
    """Return N evenly-spaced (lat, lng) points on a circle of given radius."""
    lat_per_km = 1.0 / 111.32
    lng_per_km = 1.0 / (111.32 * math.cos(math.radians(center_lat)))
    points: List[Tuple[float, float]] = []
    for i in range(n):
        angle = math.radians(angle_offset_deg + i * 360.0 / n)
        dlat = radius_km * math.sin(angle) * lat_per_km
        dlng = radius_km * math.cos(angle) * lng_per_km
        points.append((center_lat + dlat, center_lng + dlng))
    return points


def _build_osrm_url(waypoints: List[Tuple[float, float]]) -> str:
    coords = ";".join(f"{lng},{lat}" for lat, lng in waypoints)
    return f"{OSRM_BASE_URL}/{coords}?overview=full&geometries=geojson&steps=false"


def _decode_path(geometry: Dict[str, Any]) -> List[Dict[str, float]]:
    return [{"lat": c[1], "lng": c[0]} for c in geometry["coordinates"]]


def _geometric_route(
    center_lat: float,
    center_lng: float,
    distance_km: float,
    angle_offset_deg: float = 45.0,
) -> Dict[str, Any]:
    """
    Fallback: generate a smooth circular loop with no external API.
    Radius is chosen so that the circumference equals distance_km exactly.
    """
    radius_km = distance_km / (2 * math.pi)
    pts = _circle_points(center_lat, center_lng, radius_km, GEOMETRIC_POINTS, angle_offset_deg)
    # Close the loop
    path = [{"lat": lat, "lng": lng} for lat, lng in pts]
    path.append(path[0])

    actual_km = sum(
        _haversine_km(path[i]["lat"], path[i]["lng"], path[i + 1]["lat"], path[i + 1]["lng"])
        for i in range(len(path) - 1)
    )
    return {
        "start_point": {"lat": center_lat, "lng": center_lng},
        "distance_km_requested": distance_km,
        "distance_km_actual": round(actual_km, 2),
        "estimated_duration_min": round(actual_km * 12),
        "path": path,
        "source": "geometric",
    }


async def generate_route(
    center_lat: float,
    center_lng: float,
    distance_km: float,
    angle_offset_deg: float = 45.0,
) -> Dict[str, Any]:
    """
    Generate a walking loop of approximately distance_km.

    Tries OSRM first (road-snapped route); falls back to a geometric circle
    if the routing API is unreachable.
    """
    radius_km = distance_km / (2 * math.pi)
    tolerance = 0.10
    max_iterations = 10

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            actual_km = distance_km  # initialise so it's always bound
            path: List[Dict[str, float]] = []

            for _ in range(max_iterations):
                wps = _circle_points(center_lat, center_lng, radius_km,
                                     NUM_WAYPOINTS, angle_offset_deg)
                loop_wps = wps + [wps[0]]
                response = await client.get(_build_osrm_url(loop_wps))
                response.raise_for_status()
                data = response.json()

                if data.get("code") != "Ok" or not data.get("routes"):
                    raise ValueError("OSRM returned no route")

                route = data["routes"][0]
                path = _decode_path(route["geometry"])
                actual_km = route["distance"] / 1000.0

                if abs(actual_km - distance_km) / distance_km <= tolerance:
                    break

                radius_km *= distance_km / actual_km

        return {
            "start_point": {"lat": center_lat, "lng": center_lng},
            "distance_km_requested": distance_km,
            "distance_km_actual": round(actual_km, 2),
            "estimated_duration_min": round(actual_km * 12),
            "path": path,
            "source": "osrm",
        }

    except Exception:
        # OSRM unreachable (DNS failure, timeout, etc.) → geometric fallback
        return _geometric_route(center_lat, center_lng, distance_km, angle_offset_deg)
