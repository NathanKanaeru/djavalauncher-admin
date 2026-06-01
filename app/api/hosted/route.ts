import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { HostedServer } from "@/lib/types";

export async function GET(_req: NextRequest) {
  const data = await loadData();
  const servers: Omit<HostedServer, "id">[] = data.hostedServers.map(
    ({ id: _id, ...rest }) => rest
  );
  return NextResponse.json(servers);
}
