import type { GenerateRoutePayload, Neighborhood, RouteResult } from "./types";

// In production (Vercel) the API routes are part of the same Next.js app,
// so relative paths work everywhere. The env var is kept as an optional
// override for local development against a standalone Python backend.
const BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "")
    : "";

export async function fetchNeighborhoods(): Promise<Neighborhood[]> {
  const res = await fetch(`${BASE_URL}/api/neighborhoods`);
  if (!res.ok) throw new Error("Failed to load neighborhoods");
  return res.json();
}

export async function generateRoute(
  payload: GenerateRoutePayload,
): Promise<RouteResult> {
  const res = await fetch(`${BASE_URL}/api/routes/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? "Route generation failed");
  }
  return res.json();
}
