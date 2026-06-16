import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { queryServer } from "@/lib/server-query";

async function checkAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("session")?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload !== null;
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ip, port } = await req.json();
    if (!ip || !port) {
      return NextResponse.json({ error: "IP and port required" }, { status: 400 });
    }

    const details = await queryServer(ip, port);
    return NextResponse.json(details);
  } catch {
    return NextResponse.json(
      { error: "Server unreachable or query timed out" },
      { status: 400 }
    );
  }
}
