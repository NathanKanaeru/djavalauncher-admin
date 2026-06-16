export interface VersionControl {
  latestVersionCode: number;
  latestVersion: string;
  downloadUrl: string;
  changeLog: string;
}

export interface Announcement {
  id?: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
}

export interface GameDataSources {
  github: string;
  pixeldrain: string;
  dropbox: string;
}

export interface ServerEntry {
  id?: string;
  ip: string;
  port: number;
  hostname: string;
  players: number;
  maxplayers: number;
  mode: string;
  language: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  createdAt: string;
  expiresAt: string | null;
  revoked: boolean;
  lastUsedAt: string | null;
}

export interface VersionHistoryEntry {
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  changeLog: string;
  archivedAt: string;
}

export interface AppData {
  version: VersionControl;
  announcements: Announcement[];
  officialServer: ServerEntry | null;
  featuredServers: ServerEntry[];
  gameDataSources: GameDataSources;
  versionHistory: VersionHistoryEntry[];
  lastUpdatedAt?: string;
  apiKeys: ApiKey[];
}

export function defaultAppData(): AppData {
  return {
    version: {
      latestVersionCode: 130,
      latestVersion: "1.0",
      downloadUrl: "",
      changeLog: "Initial release",
    },
    announcements: [],
    officialServer: null,
    featuredServers: [],
    gameDataSources: {
      github: "https://github.com/Nathan-Studios/DjavaLauncher/releases/download/datagame/SAMP.zip",
      pixeldrain: "https://pixeldrain.com/api/file/AokkNatH",
      dropbox: "https://www.dropbox.com/scl/fi/mone7qpnna27fey475ugo/SAMP.zip?rlkey=ewhtt87jl7vl9dal2an1eh1se&st=n8twh3rc&dl=1",
    },
    versionHistory: [],
    lastUpdatedAt: undefined,
    apiKeys: [],
  };
}
