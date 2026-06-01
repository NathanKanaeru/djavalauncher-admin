import { AppData, defaultAppData } from "./types";

const KV_KEY = "app_data";

let memoryStore: AppData | null = null;

function getStore(): AppData {
  if (memoryStore) return memoryStore;
  memoryStore = defaultAppData();
  return memoryStore;
}

export async function loadData(): Promise<AppData> {
  if (process.env.VERCEL_KV_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      const data = await kv.get<AppData>(KV_KEY);
      if (data) return data;
      const defaults = defaultAppData();
      await kv.set(KV_KEY, defaults);
      return defaults;
    } catch {
      return getStore();
    }
  }
  return getStore();
}

export async function saveData(data: AppData): Promise<void> {
  if (process.env.VERCEL_KV_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      await kv.set(KV_KEY, data);
      return;
    } catch {
      memoryStore = data;
      return;
    }
  }
  memoryStore = data;
}
