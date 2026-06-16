import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  return NextResponse.json(data.version);
}

export const GET = withApiKey(handler);
