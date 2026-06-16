import { NextRequest } from "next/server";
import { ApiKey } from "./types";

export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateKeyBytes(): { plaintext: string; prefix: string } {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const plaintext = `dk_${hex}`;
  return { plaintext, prefix: plaintext.slice(0, 10) };
}

export async function createApiKey(
  name: string,
  expiresAt: string | null
): Promise<{
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  createdAt: string;
  expiresAt: string | null;
  revoked: boolean;
  lastUsedAt: null;
  plaintext: string;
}> {
  const { plaintext, prefix } = generateKeyBytes();
  const hash = await hashApiKey(plaintext);
  return {
    id: crypto.randomUUID(),
    name,
    keyPrefix: prefix,
    keyHash: hash,
    createdAt: new Date().toISOString(),
    expiresAt,
    revoked: false,
    lastUsedAt: null,
    plaintext,
  };
}

export async function validateApiKey(
  req: NextRequest,
  apiKeys: ApiKey[]
): Promise<boolean> {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;

  const token = auth.slice(7).trim();
  if (!token || !token.startsWith("dk_")) return false;

  const hash = await hashApiKey(token);
  const key = apiKeys.find((k) => k.keyHash === hash);

  if (!key) return false;
  if (key.revoked) return false;
  if (key.expiresAt && new Date(key.expiresAt) <= new Date()) return false;

  return true;
}
