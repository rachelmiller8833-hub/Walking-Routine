# 🧭 PRD -- Walking Route Generator by Jerusalem Neighborhood

## 🎯 Objective

Enable users to generate a walking route within a selected Jerusalem
neighborhood based on a desired distance (km).

The route: - Stays within or near the neighborhood - Matches distance
(±10%) - Starts and ends at same point

## 📍 Supported Neighborhoods

Nachlaot, Rehavia, Katamon, Talbia, City Center, German Colony, Baka,
Ramot, Pisgat Zeev, Neve Yaacov, Gilo, Har Homa, Talpiot, Arnona, Kiryat
Yovel, Ein Karem, Har Nof, Beit Hakerem, Kiryat Moshe

## 👤 User Flow

1.  Select neighborhood
2.  Enter distance
3.  Click "Generate Route"
4.  View map + route details

## 🖥️ Frontend

-   Dropdown (neighborhood)
-   Input (distance)
-   Button (generate)
-   Map (route)
-   Summary (distance + duration)

## 🔌 API

POST /api/routes/generate

Request: { "neighborhood": "rehavia", "distance_km": 5 }

Response: { "route_id": "uuid", "distance_km_actual": 5.2,
"estimated_duration_min": 62 }

## 🧠 Logic

-   Use neighborhood polygon
-   Pick center point
-   Generate loop via routing API
-   Adjust until distance fits

## ⚠️ Constraints

-   1--20 km
-   Must be walkable
-   Stay in area

## 🚀 Future

-   Scenic routes
-   Hills mode
-   Saved routes

## ✅ DoD

-   Valid route generated
-   Map displays correctly
-   Distance accurate



## 🎯 Objective
Enable users to generate a **walking route within a selected Jerusalem neighborhood**, based on a desired distance (in kilometers).

The system should return a **loop route** that:
- Stays within (or near) the selected neighborhood  
- Matches the requested distance (±10% tolerance)  
- Starts and ends at the same point  

---

## 📍 Supported Neighborhoods (ENUM)

```python
class Neighborhood(str, Enum):
    NACHLAOT = "nachlaot"
    REHAVIA = "rehavia"
    KATAMON = "katamon"
    TALBIA = "talbia"
    CITY_CENTER = "city_center"
    GERMAN_COLONY = "german_colony"
    BAKA = "baka"
    RAMOT = "ramot"
    PISGAT_ZEEV = "pisgat_zeev"
    NEVE_YAACOV = "neve_yaacov"
    GILO = "gilo"
    HAR_HOMA = "har_homa"
    TALPIOT = "talpiot"
    ARNONA = "arnona"
    KIRYAT_YOVEL = "kiryat_yovel"
    EIN_KAREM = "ein_karem"
    HAR_NOF = "har_nof"
    BEIT_HAKEREM = "beit_hakerem"
    KIRYAT_MOSHE = "kiryat_moshe"
👤 User Flow
User opens the app
Selects a neighborhood from dropdown
Enters desired walking distance (km)
Clicks "Generate Route"
System returns:
Map with route
Start/end point
Actual distance
Estimated walking time
🖥️ Frontend (Next.js + TypeScript)
🧩 Components
1. NeighborhoodSelector
Dropdown with predefined list
Uses ENUM mapping
Required field
2. DistanceInput
Numeric input (km)
Validation:
Min: 1 km
Max: 20 km
Step: 0.1
3. GenerateButton
Disabled until inputs valid
Shows loading state while generating
4. RouteMap
Map provider: Mapbox (preferred) / Google Maps
Renders:
Polyline (route)
Start/end marker
Zoom auto-fit to route bounds
5. RouteSummary

Displays:

Requested distance
Actual distance
Estimated duration
Start location name
🔌 API Design (FastAPI)
Endpoint
POST /api/routes/generate
Request
{
  "neighborhood": "rehavia",
  "distance_km": 5
}
Response
{
  "route_id": "uuid",
  "neighborhood": "rehavia",
  "start_point": {
    "lat": 31.768,
    "lng": 35.213,
    "name": "Gan Sacher Entrance"
  },
  "distance_km_requested": 5,
  "distance_km_actual": 5.2,
  "estimated_duration_min": 62,
  "path": [
    {"lat": 31.768, "lng": 35.213},
    {"lat": 31.769, "lng": 35.215},
    {"lat": 31.770, "lng": 35.214}
  ]
}
🧠 Core Logic (Deterministic-First)
Step 1: Neighborhood Geometry
Each neighborhood has a predefined polygon boundary
Stored in DB / static GeoJSON file

Example:

{
  "rehavia": {
    "polygon": [[lat, lng], ...],
    "center": {"lat": 31.768, "lng": 35.213}
  }
}
Step 2: Start Point Selection
Choose a deterministic start point:
Neighborhood center OR
Predefined POI list (optional upgrade)
Step 3: Route Generation Strategy
Approach A (MVP – Recommended)

Use external routing engine:

Mapbox Directions API OR
OpenRouteService

Flow:

Sample points within polygon
Build circular route:
center → waypoint1 → waypoint2 → center
Adjust waypoints until distance matches target
Approach B (Advanced)
Generate graph from street network (OSM)
Run:
Random walk with constraints
Or cycle-finding algorithm
Optimize for:
Distance
Loop closure
Step 4: Distance Matching

Algorithm:

while abs(actual_distance - target) > tolerance:
    adjust waypoints
    regenerate route

Tolerance:

±10% of requested distance
Step 5: Duration Estimation
duration_min = distance_km * 12

(Assumes ~5 km/h walking speed)

🗄️ Data Model (SQLAlchemy)
Route
class Route(Base):
    id: UUID
    neighborhood: str
    distance_requested: float
    distance_actual: float
    duration_min: int
    start_lat: float
    start_lng: float
    path_json: JSON
    created_at: datetime
⚙️ Background Jobs (Optional)
Cache generated routes per:
neighborhood + distance range
Use Redis for fast retrieval
🤖 AI Usage (Optional – Non-Critical)

Allowed use:

Naming the route (e.g., "Scenic Rehavia Walk")
Adding description:
"Passes through quiet streets and green areas"

NOT allowed:

Route calculation
Distance logic
Geometry
⚠️ Constraints
Route must remain within or near neighborhood boundary
Avoid highways / non-walkable roads
Prefer sidewalks and pedestrian-friendly streets
🧪 Edge Cases
Distance too small (<1 km) → reject
Distance too large (>20 km) → reject
Neighborhood too small for distance:
Expand slightly outside boundary OR
Return error
🚀 Future Enhancements
Multi-neighborhood routes
Elevation-aware routes (avoid hills / include hills)
Scenic mode (parks, viewpoints)
Safety mode (well-lit streets)
Save favorite routes
Share route link
✅ Definition of Done (DoD)
User can select neighborhood and distance
System returns valid loop route
Route displayed on map
Distance within ±10% tolerance
Duration calculated correctly
No crashes on invalid input
🧩 Suggested Tech Stack
Frontend: Next.js (App Router), TypeScript, Tailwind
Maps: Mapbox GL JS
Backend: FastAPI + SQLAlchemy
DB: PostgreSQL + PostGIS (recommended)
Queue: Celery + Redis (optional)
Routing API: Mapbox / OpenRouteService
🧠 Key Design Principle

Deterministic-first system:

All routing logic = code
AI = optional enhancement layer only