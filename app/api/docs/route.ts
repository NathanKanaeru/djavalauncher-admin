import { NextResponse } from "next/server";

const SPEC = {
  openapi: "3.1.0",
  info: {
    title: "DjavaLauncher Public API",
    version: "1.0.0",
    description: `# DjavaLauncher Public API

REST API for the DjavaLauncher SA-MP mobile launcher. Provides app versioning, announcements, hosted server listings, and game data download sources.

## Authentication

**Public endpoints** (5 GET routes): Require API key authentication. Pass your key via the \`Authorization: Bearer <key>\` header. Keys are generated and managed in the admin panel.

**Admin endpoints** (4 routes): Require JWT via httpOnly session cookie. Login first via \`POST /api/admin/login\`.

## Base URL

\`\`\`
https://your-domain.vercel.app
\`\`\`

## Rate Limiting

None currently implemented. Please be respectful.

## Content Type

All endpoints return \`application/json\`. All request bodies use \`application/json\`.`,
    contact: {
      name: "DjavaLauncher Admin",
      url: "https://github.com/Nathan-Studios/DjavaLauncher",
    },
  },
  servers: [
    { url: "https://your-domain.vercel.app", description: "Production" },
    { url: "http://localhost:3000", description: "Development" },
  ],
  paths: {
    "/api/version_control": {
      get: {
        tags: ["Public"],
        summary: "Get app version info",
        description: "Returns the latest version code, version name, download URL, and changelog for the launcher app.",
        operationId: "getVersionControl",
        security: [{ apiKey: [] }],
        responses: {
          "200": {
            description: "Version control information",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VersionControl" },
                example: {
                  latestVersionCode: 130,
                  latestVersion: "1.0",
                  downloadUrl: "https://example.com/djavalauncher.apk",
                  changeLog: "Initial release",
                },
              },
            },
          },
        },
      },
    },
    "/api/announcements": {
      get: {
        tags: ["Public"],
        summary: "List announcements",
        description: "Returns all active announcements for the launcher dashboard. The internal \`id\` field is stripped from each announcement.",
        operationId: "getAnnouncements",
        security: [{ apiKey: [] }],
        responses: {
          "200": {
            description: "Array of announcements (without id field)",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AnnouncementPublic" },
                },
                example: [
                  {
                    title: "Welcome to DjavaLauncher!",
                    description: "The best way to play SA-MP on mobile.",
                    date: "2026-06-16",
                    imageUrl: "https://example.com/banner.png",
                  },
                ],
              },
            },
          },
        },
      },
    },
    "/api/hosted": {
      get: {
        tags: ["Public"],
        summary: "List hosted servers",
        description: "Returns all hosted SA-MP servers. The internal \`id\` field is stripped from each server entry.",
        operationId: "getHostedServers",
        security: [{ apiKey: [] }],
        responses: {
          "200": {
            description: "Array of hosted servers (without id field)",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/HostedServerPublic" },
                },
                example: [
                  {
                    ip: "127.0.0.1",
                    port: 7777,
                    hostname: "My SA-MP Server",
                    players: 12,
                    maxplayers: 100,
                    description: "A cool roleplay server",
                    mode: "Roleplay",
                    language: "English",
                    featuredBanner: "https://example.com/banner.png",
                  },
                ],
              },
            },
          },
        },
      },
    },
    "/api/changelogs": {
      get: {
        tags: ["Public"],
        summary: "Changelogs",
        description: "Returns changelogs for all versions, from latest to earliest. Includes both the current release and archived versions.",
        operationId: "getChangelogs",
        security: [{ apiKey: [] }],
        responses: {
          "200": {
            description: "Array of changelog entries",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ChangelogEntry" },
                },
                example: [
                  { versionCode: 131, versionName: "1.1", changeLog: "- Bug fixes\n- Performance improvements", publishedAt: "2026-06-16T12:00:00.000Z" },
                  { versionCode: 130, versionName: "1.0", changeLog: "Initial release", publishedAt: "2026-06-15T08:00:00.000Z" },
                ],
              },
            },
          },
        },
      },
    },
    "/api/download_sources": {
      get: {
        tags: ["Public"],
        summary: "Get game data download sources",
        description: "Returns the available download mirrors for the SA-MP game data package. Sources are ordered by reliability.",
        operationId: "getDownloadSources",
        security: [{ apiKey: [] }],
        responses: {
          "200": {
            description: "Download sources array",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sources: {
                      type: "array",
                      items: { $ref: "#/components/schemas/DownloadSource" },
                    },
                  },
                },
                example: {
                  sources: [
                    { name: "GitHub Release", url: "https://github.com/...", tag: "Recommended" },
                    { name: "Pixeldrain", url: "https://pixeldrain.com/...", tag: "Cepat" },
                    { name: "Dropbox", url: "https://www.dropbox.com/...", tag: "Cepat" },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/login": {
      post: {
        tags: ["Admin"],
        summary: "Admin login",
        description: "Authenticate as admin. Sets an httpOnly \`session\` cookie (JWT, HS256, 24h expiry). The cookie is required for all other admin endpoints.",
        operationId: "adminLogin",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: {
                  password: {
                    type: "string",
                    description: "Admin password. Matches the \`ADMIN_PASSWORD\` environment variable. If \`ADMIN_PASSWORD\` is unset, any password is accepted (development convenience).",
                  },
                },
              },
              example: { password: "changeme123" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful. Session cookie set.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid password",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "Invalid password" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/verify": {
      get: {
        tags: ["Admin"],
        summary: "Verify admin session",
        description: "Checks whether the current session cookie is valid. Used by the admin frontend as an auth guard on mount.",
        operationId: "adminVerify",
        responses: {
          "200": {
            description: "Session is valid",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    authenticated: { type: "boolean", example: true },
                    username: { type: "string", example: "admin" },
                  },
                },
              },
            },
          },
          "401": {
            description: "No valid session cookie",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    authenticated: { type: "boolean", example: false },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/data": {
      get: {
        tags: ["Admin"],
        summary: "Get all app data",
        description: "Returns the entire AppData object. Used by the admin panel to populate all CRUD forms. Combine with PUT to modify.",
        operationId: "adminGetData",
        responses: {
          "200": {
            description: "Full AppData object",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppData" },
              },
            },
          },
          "401": {
            description: "Unauthorized (no valid session)",
          },
        },
        security: [{ sessionCookie: [] }],
      },
      put: {
        tags: ["Admin"],
        summary: "Update all app data",
        description: "Replaces the entire AppData object. The request body is a partial or full AppData. Missing fields fall back to current values. This is the **only** write endpoint — all CRUD operations go through this single endpoint.",
        operationId: "adminPutData",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AppData" },
              example: {
                version: {
                  latestVersionCode: 131,
                  latestVersion: "1.1",
                  downloadUrl: "https://example.com/new.apk",
                  changeLog: "- Bug fixes\n- Performance improvements",
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Data saved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request body",
          },
          "401": {
            description: "Unauthorized (no valid session)",
          },
        },
        security: [{ sessionCookie: [] }],
      },
    },
  },
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "session",
        description: "httpOnly JWT session cookie (HS256, 24h expiry). Obtained via POST /api/admin/login.",
      },
      apiKey: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description:
          "API key authentication. Prefix the key with 'Bearer '. Example: 'Bearer dk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'",
      },
    },
    schemas: {
      VersionControl: {
        type: "object",
        description: "App version control information",
        properties: {
          latestVersionCode: {
            type: "integer",
            description: "Integer version code for programmatic comparison (e.g., 130)",
            example: 130,
          },
          latestVersion: {
            type: "string",
            description: "Human-readable version string (e.g., \"1.0\")",
            example: "1.0",
          },
          downloadUrl: {
            type: "string",
            format: "uri",
            description: "Direct download URL for the latest APK",
            example: "https://example.com/djavalauncher.apk",
          },
          changeLog: {
            type: "string",
            description: "Markdown changelog describing what's new",
            example: "- Bug fixes\n- Performance improvements",
          },
        },
        required: ["latestVersionCode", "latestVersion", "downloadUrl", "changeLog"],
      },
      ChangelogEntry: {
        type: "object",
        description: "A single version's changelog entry (public — no internal id fields)",
        properties: {
          versionCode: { type: "integer", description: "Integer version code for comparison", example: 131 },
          versionName: { type: "string", description: "Human-readable version string", example: "1.1" },
          changeLog: { type: "string", description: "Markdown changelog describing what's new in this version", example: "- Bug fixes\n- Performance improvements" },
          publishedAt: { type: "string", format: "date-time", description: "ISO date when this version was published", example: "2026-06-16T12:00:00.000Z" },
        },
        required: ["versionCode", "versionName", "changeLog", "publishedAt"],
      },
      Announcement: {
        type: "object",
        description: "A dashboard announcement (full object with internal id)",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Internal unique identifier (stripped from public API responses)",
            example: "a1b2c3d4-...",
          },
          title: {
            type: "string",
            description: "Announcement headline",
            example: "Welcome to DjavaLauncher!",
          },
          description: {
            type: "string",
            description: "Announcement body text",
            example: "The best way to play SA-MP on mobile.",
          },
          date: {
            type: "string",
            format: "date",
            description: "Publication date (YYYY-MM-DD)",
            example: "2026-06-16",
          },
          imageUrl: {
            type: "string",
            format: "uri",
            description: "Optional announcement banner image URL",
            example: "https://example.com/banner.png",
          },
        },
        required: ["title", "description", "date", "imageUrl"],
      },
      AnnouncementPublic: {
        type: "object",
        description: "A dashboard announcement (public — id field stripped)",
        properties: {
          title: {
            type: "string",
            description: "Announcement headline",
            example: "Welcome to DjavaLauncher!",
          },
          description: {
            type: "string",
            description: "Announcement body text",
            example: "The best way to play SA-MP on mobile.",
          },
          date: {
            type: "string",
            format: "date",
            description: "Publication date (YYYY-MM-DD)",
            example: "2026-06-16",
          },
          imageUrl: {
            type: "string",
            format: "uri",
            description: "Optional announcement banner image URL",
            example: "https://example.com/banner.png",
          },
        },
        required: ["title", "description", "date", "imageUrl"],
      },
      HostedServer: {
        type: "object",
        description: "A hosted SA-MP server entry (full object with internal id)",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Internal unique identifier (stripped from public API responses)",
            example: "e5f6g7h8-...",
          },
          ip: {
            type: "string",
            description: "Server IP address",
            example: "127.0.0.1",
          },
          port: {
            type: "integer",
            description: "Server port",
            example: 7777,
          },
          hostname: {
            type: "string",
            description: "Server display name",
            example: "My SA-MP Server",
          },
          players: {
            type: "integer",
            description: "Current player count",
            example: 12,
          },
          maxplayers: {
            type: "integer",
            description: "Maximum player capacity",
            example: 100,
          },
          description: {
            type: "string",
            description: "Server description or MOTD",
            example: "A cool roleplay server",
          },
          mode: {
            type: "string",
            description: "Game mode (Roleplay, Deathmatch, etc.)",
            example: "Roleplay",
          },
          language: {
            type: "string",
            description: "Primary server language",
            example: "English",
          },
          featuredBanner: {
            type: "string",
            format: "uri",
            description: "Optional featured banner image URL",
            example: "https://example.com/banner.png",
          },
        },
        required: ["ip", "port", "hostname", "players", "maxplayers", "description", "mode", "language", "featuredBanner"],
      },
      HostedServerPublic: {
        type: "object",
        description: "A hosted SA-MP server entry (public — id field stripped)",
        properties: {
          ip: { type: "string", example: "127.0.0.1" },
          port: { type: "integer", example: 7777 },
          hostname: { type: "string", example: "My SA-MP Server" },
          players: { type: "integer", example: 12 },
          maxplayers: { type: "integer", example: 100 },
          description: { type: "string", example: "A cool roleplay server" },
          mode: { type: "string", example: "Roleplay" },
          language: { type: "string", example: "English" },
          featuredBanner: { type: "string", example: "https://example.com/banner.png" },
        },
        required: ["ip", "port", "hostname", "players", "maxplayers", "description", "mode", "language", "featuredBanner"],
      },
      GameDataSources: {
        type: "object",
        description: "Game data package download URL configuration",
        properties: {
          github: {
            type: "string",
            format: "uri",
            description: "GitHub Release download URL",
            example: "https://github.com/...",
          },
          pixeldrain: {
            type: "string",
            format: "uri",
            description: "Pixeldrain mirror URL",
            example: "https://pixeldrain.com/...",
          },
          dropbox: {
            type: "string",
            format: "uri",
            description: "Dropbox mirror URL",
            example: "https://www.dropbox.com/...",
          },
        },
        required: ["github", "pixeldrain", "dropbox"],
      },
      DownloadSource: {
        type: "object",
        description: "A named download source with reliability tag",
        properties: {
          name: {
            type: "string",
            description: "Source display name",
            example: "GitHub Release",
          },
          url: {
            type: "string",
            format: "uri",
            description: "Download URL",
            example: "https://github.com/...",
          },
          tag: {
            type: "string",
            description: "Reliability/speed tag (e.g., \"Recommended\", \"Cepat\")",
            example: "Recommended",
          },
        },
        required: ["name", "url", "tag"],
      },
      AppData: {
        type: "object",
        description: "Root data object — the entire application state",
        properties: {
          version: { $ref: "#/components/schemas/VersionControl" },
          announcements: {
            type: "array",
            items: { $ref: "#/components/schemas/Announcement" },
          },
          hostedServers: {
            type: "array",
            items: { $ref: "#/components/schemas/HostedServer" },
          },
          gameDataSources: { $ref: "#/components/schemas/GameDataSources" },
        },
        required: ["version", "announcements", "hostedServers", "gameDataSources"],
      },
    },
  },
  tags: [
    {
      name: "Public",
      description: "Endpoints consumed by the mobile launcher app. No authentication required.",
    },
    {
      name: "Admin",
      description: "Admin panel endpoints. Require JWT session cookie obtained via login.",
    },
  ],
  externalDocs: {
    description: "GitHub Repository",
    url: "https://github.com/Nathan-Studios/DjavaLauncher",
  },
};

export async function GET() {
  return NextResponse.json(SPEC, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
