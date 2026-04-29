export interface Neighborhood {
  value: string;
  label: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  route_id: string;
  neighborhood: string;
  neighborhood_label: string;
  start_point: LatLng;
  distance_km_requested: number;
  distance_km_actual: number;
  estimated_duration_min: number;
  path: LatLng[];
}

export interface GenerateRoutePayload {
  neighborhood: string;
  distance_km: number;
}
