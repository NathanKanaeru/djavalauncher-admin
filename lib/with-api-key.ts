import { NextRequest, NextResponse } from "next/server";
import { loadData, saveData } from "./store";
import { validateApiKey, hashApiKey } from "./api-key";

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

export function withApiKey(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest) => {
    const data = await loadData();
    const valid = await validateApiKey(req, data.apiKeys ?? []);

    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = req.headers.get("authorization")!;
    const token = auth.slice(7).trim();
    const hash = await hashApiKey(token);
    const keyIndex = (data.apiKeys ?? []).findIndex((k) => k.keyHash === hash);
    if (keyIndex !== -1) {
      data.apiKeys![keyIndex].lastUsedAt = new Date().toISOString();
      saveData(data).catch(() => {});
    }

    return handler(req);
  };
}
