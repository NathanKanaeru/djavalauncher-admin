import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { ServerEntry } from "@/lib/types";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  const servers: Omit<ServerEntry, "id">[] = (data.featuredServers || []).map(
    ({ id: _id, ...rest }) => rest
  );
  return NextResponse.json(servers);
}

export const GET = withApiKey(handler);
