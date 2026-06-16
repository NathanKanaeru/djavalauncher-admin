import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { Announcement } from "@/lib/types";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  const announcements: Omit<Announcement, "id">[] = data.announcements.map(
    ({ id: _id, ...rest }) => rest
  );
  return NextResponse.json(announcements);
}

export const GET = withApiKey(handler);
