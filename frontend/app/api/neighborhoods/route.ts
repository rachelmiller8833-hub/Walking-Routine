import { NextResponse } from "next/server";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

// Revalidate never — the list is static data
export const revalidate = false;

export function GET() {
  const list = NEIGHBORHOODS.map(({ value, label }) => ({ value, label }));
  return NextResponse.json(list);
}
