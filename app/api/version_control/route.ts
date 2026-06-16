import { NextRequest, NextResponse } from "next/server";
import { loadData, saveData } from "@/lib/store";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  return NextResponse.json(data.version);
}

export const GET = withApiKey(handler);

async function putHandler(req: NextRequest) {
  const data = await loadData();
  const body = await req.json();

  const oldVersion = data.version;

  const updated = {
    latestVersionCode: body.latestVersionCode ?? oldVersion.latestVersionCode,
    latestVersion: body.latestVersion ?? oldVersion.latestVersion,
    downloadUrl: body.downloadUrl ?? oldVersion.downloadUrl,
    changeLog: body.changeLog ?? oldVersion.changeLog,
  };

  if (updated.latestVersionCode !== oldVersion.latestVersionCode) {
    data.versionHistory = [
      ...(data.versionHistory ?? []),
      {
        versionCode: oldVersion.latestVersionCode,
        versionName: oldVersion.latestVersion,
        downloadUrl: oldVersion.downloadUrl,
        changeLog: oldVersion.changeLog,
        archivedAt: new Date().toISOString(),
      },
    ];
  }

  data.version = updated;
  data.lastUpdatedAt = new Date().toISOString();
  await saveData(data);

  return NextResponse.json(updated);
}

export const PUT = withApiKey(putHandler);
