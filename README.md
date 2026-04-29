# Walk Jerusalem — Walking Route Generator

Generate personalised loop walking routes through Jerusalem neighborhoods.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 · TypeScript · Tailwind CSS v4 · Leaflet |
| Backend | FastAPI · Python 3.10+ · httpx |
| Map tiles | CARTO Dark (via Leaflet) |
| Routing | OSRM public API (no API key required) |

## Project Structure

```
Neighborhood/
├── backend/        FastAPI app
│   ├── main.py             API routes + CORS
│   ├── neighborhoods.py    Neighborhood centres (lat/lng)
│   ├── route_generator.py  OSRM loop route logic
│   └── requirements.txt
└── frontend/       Next.js app
    ├── app/
    │   ├── page.tsx        Main page (sidebar + map)
    │   └── globals.css
    ├── components/
    │   ├── RouteMap.tsx    Leaflet map
    │   └── RouteSummary.tsx  Route stats card
    └── lib/
        ├── api.ts          API client
        └── types.ts        Shared TypeScript types
```

## Running Locally

### Backend (port 8000)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (port 3000)

```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## API

### `GET /api/neighborhoods`
Returns all supported neighborhoods.

### `POST /api/routes/generate`
```json
{ "neighborhood": "rehavia", "distance_km": 5 }
```
Returns a loop route with path coordinates, actual distance, and estimated duration.

## Route Generation Logic

1. Compute a radius: `r = distance_km / (2π)`
2. Place 8 waypoints evenly on that circle around the neighborhood centre
3. Call OSRM Foot routing API to snap waypoints to real walkable streets
4. Scale radius iteratively until actual distance is within ±10% of target
5. Return path + stats
