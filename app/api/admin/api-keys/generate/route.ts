import { NextRequest, NextResponse } from "next/server";
import { createApiKey } from "@/lib/api-key";

export async function POST(req: NextRequest) {
  try {
    const { name, expiresAt } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await createApiKey(name.trim(), expiresAt || null);

    return NextResponse.json({
      key: {
        id: result.id,
        name: result.name,
        keyPrefix: result.keyPrefix,
        keyHash: result.keyHash,
        createdAt: result.createdAt,
        expiresAt: result.expiresAt,
        revoked: result.revoked,
        lastUsedAt: result.lastUsedAt,
      },
      plaintext: result.plaintext,
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
  }
}
