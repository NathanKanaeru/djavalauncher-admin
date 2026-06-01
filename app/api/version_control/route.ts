import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";

export async function GET(_req: NextRequest) {
  const data = await loadData();
  return NextResponse.json(data.version);
}
