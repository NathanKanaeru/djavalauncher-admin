import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  return NextResponse.json({
    sources: [
      { name: "GitHub Release", url: data.gameDataSources.github, tag: "Recommended" },
      { name: "Pixeldrain", url: data.gameDataSources.pixeldrain, tag: "Cepat" },
      { name: "Dropbox", url: data.gameDataSources.dropbox, tag: "Cepat" },
    ],
  });
}

export const GET = withApiKey(handler);
