import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();

  const entries: { versionCode: number; versionName: string; downloadUrl: string; downloadUrl64: string; changeLog: string; publishedAt: string }[] = [];

  if (data.version) {
    entries.push({
      versionCode: data.version.latestVersionCode,
      versionName: data.version.latestVersion,
      downloadUrl: data.version.downloadUrl,
      downloadUrl64: data.version.downloadUrl64,
      changeLog: data.version.changeLog,
      publishedAt: data.lastUpdatedAt ?? new Date().toISOString(),
    });
  }

  if (data.versionHistory) {
    for (const h of data.versionHistory) {
      entries.push({
        versionCode: h.versionCode,
        versionName: h.versionName,
        downloadUrl: h.downloadUrl,
        downloadUrl64: h.downloadUrl64,
        changeLog: h.changeLog,
        publishedAt: h.archivedAt,
      });
    }
  }

  entries.sort((a, b) => b.versionCode - a.versionCode);

  return NextResponse.json(entries);
}

export const GET = withApiKey(handler);
