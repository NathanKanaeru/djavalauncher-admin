import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { loadData, saveData } from "@/lib/store";
import { AppData } from "@/lib/types";

async function checkAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("session")?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload !== null;
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await loadData();
  return NextResponse.json({
    ...data,
    versionHistory: data.versionHistory ?? [],
    apiKeys: data.apiKeys ?? [],
    lastUpdatedAt: data.lastUpdatedAt ?? undefined,
  });
}

export async function PUT(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: Partial<AppData> = await req.json();
    const current = await loadData();
    const updated: AppData = {
      version: body.version ?? current.version,
      announcements: body.announcements ?? current.announcements,
      hostedServers: body.hostedServers ?? current.hostedServers,
      gameDataSources: body.gameDataSources ?? current.gameDataSources,
      versionHistory: body.versionHistory ?? current.versionHistory ?? [],
      lastUpdatedAt: body.lastUpdatedAt ?? current.lastUpdatedAt,
      apiKeys: body.apiKeys ?? current.apiKeys ?? [],
    };
    await saveData(updated);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
