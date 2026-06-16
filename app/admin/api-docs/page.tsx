"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Globe,
  Lock,
  ChevronRight,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Server,
  Megaphone,
  RefreshCw,
  Download,
  LogIn,
  ShieldCheck,
  Database,
  ChevronDown,
  FileText,
} from "lucide-react";

interface EndpointDoc {
  method: string;
  path: string;
  tag: string;
  summary: string;
  description: string;
  auth: boolean;
  requestBody?: string;
  responseExample: string;
  curlExample: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: "GET", path: "/api/version_control", tag: "Public",
    summary: "Get app version info",
    description: "Returns the latest version code, version name, download URL, and changelog for the launcher app.",
    auth: false,
    responseExample: JSON.stringify({
      latestVersionCode: 130,
      latestVersion: "1.0",
      downloadUrl: "https://example.com/djavalauncher.apk",
      changeLog: "Initial release",
    }, null, 2),
    curlExample: "curl https://your-domain.vercel.app/api/version_control",
  },
  {
    method: "GET", path: "/api/changelogs", tag: "Public",
    summary: "Changelogs",
    description: "Returns changelogs for all versions, from latest to earliest. Includes both the current release and every archived version.",
    auth: false,
    responseExample: JSON.stringify([
      { versionCode: 131, versionName: "1.1", changeLog: "- Bug fixes\n- Performance improvements", publishedAt: "2026-06-16T12:00:00.000Z" },
      { versionCode: 130, versionName: "1.0", changeLog: "Initial release", publishedAt: "2026-06-15T08:00:00.000Z" },
    ], null, 2),
    curlExample: "curl https://your-domain.vercel.app/api/changelogs",
  },
  {
    method: "GET", path: "/api/announcements", tag: "Public",
    summary: "List announcements",
    description: "Returns all active announcements for the launcher dashboard. The internal `id` field is stripped from each announcement for security.",
    auth: false,
    responseExample: JSON.stringify([
      { title: "Welcome!", description: "The best way to play SA-MP on mobile.", date: "2026-06-16", imageUrl: "" },
    ], null, 2),
    curlExample: "curl https://your-domain.vercel.app/api/announcements",
  },
  {
    method: "GET", path: "/api/hosted", tag: "Public",
    summary: "List hosted servers",
    description: "Returns all hosted SA-MP servers with IP, port, player counts, mode, and language. The internal `id` field is stripped from each server.",
    auth: false,
    responseExample: JSON.stringify([
      { ip: "127.0.0.1", port: 7777, hostname: "My Server", players: 12, maxplayers: 100, description: "", mode: "Roleplay", language: "English", featuredBanner: "" },
    ], null, 2),
    curlExample: "curl https://your-domain.vercel.app/api/hosted",
  },
  {
    method: "GET", path: "/api/download_sources", tag: "Public",
    summary: "Get game data download sources",
    description: "Returns available download mirrors for the SA-MP game data package, ordered by reliability with speed tags.",
    auth: false,
    responseExample: JSON.stringify({
      sources: [
        { name: "GitHub Release", url: "https://github.com/...", tag: "Recommended" },
        { name: "Pixeldrain", url: "https://pixeldrain.com/...", tag: "Cepat" },
      ],
    }, null, 2),
    curlExample: "curl https://your-domain.vercel.app/api/download_sources",
  },
  {
    method: "POST", path: "/api/admin/login", tag: "Admin",
    summary: "Admin login",
    description: "Authenticate as admin. Sends password, receives an httpOnly session cookie (JWT, HS256, 24h expiry). This cookie must be included in all subsequent admin requests.",
    auth: false,
    requestBody: JSON.stringify({ password: "your-admin-password" }, null, 2),
    responseExample: JSON.stringify({ success: true }, null, 2),
    curlExample: `curl -X POST https://your-domain.vercel.app/api/admin/login \\
  -H "Content-Type: application/json" \\
  -d '{"password":"changeme123"}' \\
  -c cookies.txt`,
  },
  {
    method: "GET", path: "/api/admin/verify", tag: "Admin",
    summary: "Verify admin session",
    description: "Checks whether the current session cookie is valid. Returns the authenticated username on success.",
    auth: true,
    responseExample: JSON.stringify({ authenticated: true, username: "admin" }, null, 2),
    curlExample: `curl https://your-domain.vercel.app/api/admin/verify \\
  -b cookies.txt`,
  },
  {
    method: "GET", path: "/api/admin/data", tag: "Admin",
    summary: "Get all app data",
    description: "Returns the entire AppData object — version, announcements, servers, and game data sources. Used by the admin panel to populate CRUD forms.",
    auth: true,
    responseExample: JSON.stringify({
      version: { latestVersionCode: 130, latestVersion: "1.0", downloadUrl: "", changeLog: "Initial release" },
      announcements: [],
      hostedServers: [],
      gameDataSources: {
        github: "https://github.com/...",
        pixeldrain: "https://pixeldrain.com/...",
        dropbox: "https://www.dropbox.com/...",
      },
    }, null, 2),
    curlExample: `curl https://your-domain.vercel.app/api/admin/data \\
  -b cookies.txt`,
  },
  {
    method: "PUT", path: "/api/admin/data", tag: "Admin",
    summary: "Update all app data",
    description: "Replaces the entire AppData object. This is the **single write endpoint** — all CRUD operations (announcements, servers, version, game data) go through this one endpoint. Missing fields fall back to current values.",
    auth: true,
    requestBody: JSON.stringify({
      version: { latestVersionCode: 131, latestVersion: "1.1", downloadUrl: "https://...", changeLog: "- Bug fixes" },
    }, null, 2),
    responseExample: JSON.stringify({ success: true }, null, 2),
    curlExample: `curl -X PUT https://your-domain.vercel.app/api/admin/data \\
  -H "Content-Type: application/json" \\
  -b cookies.txt \\
  -d '{"version":{"latestVersionCode":131,"latestVersion":"1.1","downloadUrl":"https://...","changeLog":"- Bug fixes"}}'`,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-accent bg-accent-soft",
  POST: "text-emerald-400 bg-emerald-400/10",
  PUT: "text-amber-400 bg-amber-400/10",
};

export default function ApiDocsPage() {
  const [expanded, setExpanded] = useState<string | null>(`${ENDPOINTS[0].method}-${ENDPOINTS[0].path}`);
  const [copied, setCopied] = useState<string | null>(null);

  async function copyText(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="animate-fade-in max-w-[960px]">
      {/* ── Page Header ── */}
      <div className="mb-lg">
        <h1 className="text-display text-ink m-0 flex items-center gap-sm">
          <BookOpen size={28} className="text-accent" />
          API Documentation
        </h1>
        <p className="text-body text-mute mt-xxs">
          Complete reference for the DjavaLauncher REST API &mdash; for developers and AI agents
        </p>
      </div>

      {/* ── Info Banner ── */}
      <div className="card p-md mb-lg flex items-start gap-md">
        <div className="w-[36px] h-[36px] rounded-lg bg-accent-soft flex items-center justify-center flex-shrink-0">
          <Globe size={18} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-strong text-ink m-0">OpenAPI 3.1 Compatible</p>
          <p className="text-body text-mute mt-xxs">
            A machine-readable OpenAPI JSON spec is available at{" "}
            <code className="text-caption-mono text-accent bg-accent-soft rounded-xs px-xs py-xxs">
              GET /api/docs
            </code>
            . AI agents and API tools can consume it directly.
          </p>
        </div>
        <button
          onClick={() => copyText(
            `${window.location.origin}/api/docs`,
            "openapi-url"
          )}
          className="btn-ghost flex items-center gap-xs text-caption flex-shrink-0"
        >
          {copied === "openapi-url" ? (
            <><Check size={14} className="text-accent" /> Copied</>
          ) : (
            <><Copy size={14} /> Copy URL</>
          )}
        </button>
      </div>

      {/* ── Quick Nav ── */}
      <div className="flex flex-wrap gap-xs mb-lg">
        {["Public", "Admin"].map((tag) => (
          <a
            key={tag}
            href={`#tag-${tag}`}
            className="badge hover:bg-surface-raised hover:text-ink transition-colors no-underline"
          >
            {tag === "Public" ? <Globe size={12} className="mr-xxs" /> : <Lock size={12} className="mr-xxs" />}
            {tag}
          </a>
        ))}
      </div>

      {/* ── Endpoint List ── */}
      <div className="flex flex-col gap-sm">
        {ENDPOINTS.map((ep) => {
          const isOpen = expanded === `${ep.method}-${ep.path}`;
          const Icon = getIconForPath(ep.path);

          return (
            <div
              key={`${ep.method}-${ep.path}`}
              className="card overflow-hidden transition-all duration-200"
            >
              {/* ── Endpoint Header (clickable) ── */}
              <button
                onClick={() => setExpanded(isOpen ? null : `${ep.method}-${ep.path}`)}
                className="w-full flex items-center gap-md p-lg text-left hover:bg-surface-raised/50 transition-colors"
              >
                <div className="w-[36px] h-[36px] rounded-lg bg-surface-raised flex items-center justify-center flex-shrink-0">
                  {Icon && <Icon size={18} className="text-body" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-sm mb-xxs">
                    <span className={`text-caption-mono font-medium px-xs py-xxs rounded-xs ${METHOD_COLORS[ep.method] || ""}`}>
                      {ep.method}
                    </span>
                    <code className="text-caption-mono text-ink">{ep.path}</code>
                    {ep.auth && (
                      <Lock size={12} className="text-mute flex-shrink-0" />
                    )}
                    {!ep.auth && ep.tag === "Public" && (
                      <Globe size={12} className="text-accent flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-body text-body m-0">{ep.summary}</p>
                </div>

                <ChevronDown
                  size={18}
                  className={`text-mute flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ── Endpoint Detail (expandable) ── */}
              {isOpen && (
                <div className="px-lg pb-lg border-t border-hairline animate-fade-in">
                  <div className="pt-md space-y-md">
                    {/* Description */}
                    <p className="text-body text-body leading-relaxed">{ep.description}</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
                      {/* cURL Example */}
                      <div className="p-md rounded-md bg-[#050505] border border-hairline">
                        <div className="flex items-center justify-between mb-sm">
                          <span className="text-caption-mono text-mute flex items-center gap-xxs">
                            <Code2 size={12} /> cURL
                          </span>
                          <button
                            onClick={() => copyText(ep.curlExample, `curl-${ep.path}`)}
                            className="btn-ghost p-xs text-caption"
                          >
                            {copied === `curl-${ep.path}` ? (
                              <Check size={12} className="text-accent" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        <pre className="text-caption-mono text-body m-0 whitespace-pre-wrap break-all">{ep.curlExample}</pre>
                      </div>

                      {/* Response */}
                      <div className="p-md rounded-md bg-[#050505] border border-hairline">
                        <div className="flex items-center justify-between mb-sm">
                          <span className="text-caption-mono text-mute">Response 200</span>
                          <button
                            onClick={() => copyText(ep.responseExample, `res-${ep.path}`)}
                            className="btn-ghost p-xs text-caption"
                          >
                            {copied === `res-${ep.path}` ? (
                              <Check size={12} className="text-accent" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        <pre className="text-caption-mono text-body m-0 whitespace-pre-wrap break-all">{ep.responseExample}</pre>
                      </div>
                    </div>

                    {/* Request Body (if POST/PUT) */}
                    {ep.requestBody && (
                      <div className="p-md rounded-md bg-[#050505] border border-hairline">
                        <div className="flex items-center gap-sm mb-sm">
                          <span className="text-caption-mono text-mute">Request Body</span>
                          <span className="badge bg-amber-400/10 text-amber-400">application/json</span>
                        </div>
                        <pre className="text-caption-mono text-body m-0 whitespace-pre-wrap">{ep.requestBody}</pre>
                      </div>
                    )}

                    {/* Schema link */}
                    <div className="flex items-center gap-xs text-caption text-mute">
                      <Database size={12} />
                      <span>Full schema definitions available in the</span>
                      <a
                        href={`${window.location.origin}/api/docs`}
                        target="_blank"
                        className="text-accent hover:underline inline-flex items-center gap-xxs"
                      >
                        OpenAPI JSON spec
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getIconForPath(path: string) {
  switch (path) {
    case "/api/version_control": return RefreshCw;
    case "/api/changelogs": return FileText;
    case "/api/announcements": return Megaphone;
    case "/api/hosted": return Server;
    case "/api/download_sources": return Download;
    case "/api/admin/login": return LogIn;
    case "/api/admin/verify": return ShieldCheck;
    case "/api/admin/data": return Database;
    default: return Code2;
  }
}
