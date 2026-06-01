import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { Announcement } from "@/lib/types";

export async function GET(_req: NextRequest) {
  const data = await loadData();
  const announcements: Omit<Announcement, "id">[] = data.announcements.map(
    ({ id: _id, ...rest }) => rest
  );
  return NextResponse.json(announcements);
}
