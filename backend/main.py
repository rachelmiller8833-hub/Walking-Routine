import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from neighborhoods import NEIGHBORHOOD_CENTERS, NEIGHBORHOOD_DISPLAY_NAMES
from route_generator import generate_route

app = FastAPI(title="Walking Route Generator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RouteRequest(BaseModel):
    neighborhood: str
    distance_km: float

    @field_validator("neighborhood")
    @classmethod
    def validate_neighborhood(cls, v: str) -> str:
        if v not in NEIGHBORHOOD_CENTERS:
            raise ValueError(f"Unknown neighborhood: {v}")
        return v

    @field_validator("distance_km")
    @classmethod
    def validate_distance(cls, v: float) -> float:
        if v < 1.0:
            raise ValueError("Minimum distance is 1 km")
        if v > 20.0:
            raise ValueError("Maximum distance is 20 km")
        return v


@app.get("/api/neighborhoods")
def list_neighborhoods():
    return [
        {"value": k, "label": NEIGHBORHOOD_DISPLAY_NAMES[k]}
        for k in NEIGHBORHOOD_CENTERS
    ]


@app.post("/api/routes/generate")
async def create_route(request: RouteRequest):
    center = NEIGHBORHOOD_CENTERS[request.neighborhood]
    try:
        result = await generate_route(
            center_lat=center[0],
            center_lng=center[1],
            distance_km=request.distance_km,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Route generation failed: {exc}")

    return {
        "route_id": str(uuid.uuid4()),
        "neighborhood": request.neighborhood,
        "neighborhood_label": NEIGHBORHOOD_DISPLAY_NAMES[request.neighborhood],
        **result,
    }


@app.get("/health")
def health():
    return {"status": "ok"}
