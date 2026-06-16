import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();

  if (!data.officialServer) {
    return NextResponse.json(null);
  }

  const { id: _id, ...rest } = data.officialServer;
  return NextResponse.json(rest);
}

export const GET = withApiKey(handler);
