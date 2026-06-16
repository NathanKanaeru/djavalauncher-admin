import { ServerEntry } from "./types";

interface QueryResult {
  address: string;
  hostname: string;
  gamemode: string;
  mapname: string;
  passworded: boolean;
  maxplayers: number;
  online: number;
  rules: Record<string, string | boolean | number>;
  players: Array<{ id: number; name: string; score: number; ping: number }>;
}

export async function queryServer(
  ip: string,
  port: number
): Promise<Omit<ServerEntry, "id">> {
  const sampQuery = require("samp-query");

  const result: QueryResult = await new Promise((resolve, reject) => {
    sampQuery(
      { host: ip, port, timeout: 5000 },
      (err: Error | null, data: QueryResult) => {
        if (err) reject(err);
        else resolve(data);
      }
    );
  });

  return {
    ip,
    port,
    hostname: result.hostname || "",
    players: result.online || 0,
    maxplayers: result.maxplayers || 0,
    mode: result.gamemode || "",
    language: "",
  };
}
