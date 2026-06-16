"use client";

import { useEffect, useState } from "react";
import { AppData, VersionHistoryEntry } from "@/lib/types";
import {
  LayoutDashboard,
  RefreshCw,
  Server,
  Database,
  Megaphone,
  Download,
  ArrowUpRight,
  Info,
  Terminal,
  Activity,
  Clock,
  Zap,
  History,
  ExternalLink,
  ListOrdered,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    fetch("/api/admin/data").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="animate-fade-in">
        <div className="w-[200px] h-[16px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-lg">
              <div className="w-[36px] h-[36px] bg-surface-raised rounded-lg animate-skeleton mb-sm" />
              <div className="w-[70px] h-[28px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
              <div className="w-[90px] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Announcements", value: data.announcements.length, icon: Megaphone, gradient: "from-gradient-start to-gradient-end" },
    { label: "Hosted Servers", value: data.hostedServers.length, icon: Server, gradient: "from-violet-500 to-pink-500" },
    { label: "App Version", value: `v${data.version.latestVersion}`, icon: RefreshCw, gradient: "from-amber-500 to-orange-500" },
    { label: "Data Sources", value: "3", icon: Database, gradient: "from-emerald-500 to-teal-500" },
  ];

  const lastUpdated = data.lastUpdatedAt
    ? new Date(data.lastUpdatedAt)
    : null;

  const recentHistory = (data.versionHistory || []).slice(-3).reverse();

  return (
    <div className="animate-fade-in max-w-[1280px]">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h1 className="text-display text-ink m-0">Dashboard</h1>
          <p className="text-body text-mute mt-xxs">Overview of your DjavaLauncher instance</p>
        </div>
        <div className="hidden sm:flex items-center gap-xs text-caption text-mute bg-surface-raised rounded-md px-sm py-xs border border-hairline">
          <LayoutDashboard size={14} />
          <span>Admin v1.0</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isFirst = i === 0;
          return (
            <div
              key={stat.label}
              className={`${isFirst ? "card-accent" : "card"} card-hover p-lg`}
            >
              <div
                className={`stat-icon bg-gradient-to-br ${stat.gradient} ${
                  isFirst ? "bg-none" : ""
                }`}
                style={{
                  background: isFirst
                    ? "linear-gradient(135deg, rgba(0,112,243,0.15), rgba(0,223,216,0.1))"
                    : undefined,
                }}
              >
                <Icon size={20} className={isFirst ? "text-accent" : "text-white"} />
              </div>
              <div className="text-display text-ink mt-xs">{stat.value}</div>
              <div className="text-body text-mute mt-xxs">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md mb-lg">
        {/* Quick Info */}
        <div className="card p-lg">
          <div className="flex items-center gap-sm mb-md">
            <Info size={18} className="text-accent" />
            <h2 className="text-subheading text-ink m-0">Quick Info</h2>
          </div>
          <div className="space-y-sm">
            {[
              { label: "Latest Version", value: `${data.version.latestVersion} (code ${data.version.latestVersionCode})` },
              { label: "Download URL", value: data.version.downloadUrl || "\u2014", accent: true },
              { label: "Change Log", value: data.version.changeLog || "\u2014" },
              { label: "Hosted Servers", value: `${data.hostedServers.length} total` },
              { label: "Announcements", value: `${data.announcements.length} total` },
              { label: "Game Data Sources", value: "GitHub / Pixeldrain / Dropbox" },
            ].map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-md py-xs border-b border-hairline last:border-b-0">
                <span className="text-caption text-mute flex-shrink-0 w-[140px]">{row.label}</span>
                <span className={`text-body text-right break-all ${row.accent ? "text-accent" : "text-ink"}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="card p-lg">
          <div className="flex items-center gap-sm mb-md">
            <Terminal size={18} className="text-accent" />
            <h2 className="text-subheading text-ink m-0">API Endpoints</h2>
          </div>
          <div className="flex flex-col gap-sm">
            {[
              { method: "GET", path: "/api/version_control", desc: "App version check", icon: RefreshCw },
              { method: "GET", path: "/api/announcements", desc: "Dashboard announcements", icon: Megaphone },
              { method: "GET", path: "/api/hosted", desc: "Server list", icon: Server },
              { method: "GET", path: "/api/download_sources", desc: "Game data download URLs", icon: Download },
            ].map((ep) => {
              const Icon = ep.icon;
              return (
                <div
                  key={ep.path}
                  className="flex items-center gap-sm p-sm rounded-md hover:bg-surface-raised transition-colors"
                >
                  <div className="w-[32px] h-[32px] rounded-md bg-accent-soft flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <code className="text-caption-mono text-accent">{ep.method} {ep.path}</code>
                    <div className="text-caption text-mute truncate">{ep.desc}</div>
                  </div>
                  <ArrowUpRight size={14} className="text-mute flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Dashboard Extras ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-md mb-lg">

        {/* System Status */}
        <div className="card p-lg">
          <div className="flex items-center gap-sm mb-md">
            <Activity size={18} className="text-emerald-400" />
            <h2 className="text-subheading text-ink m-0">System Status</h2>
          </div>
          <div className="space-y-sm">
            <div className="flex items-center justify-between py-xs">
              <span className="text-caption text-mute">API</span>
              <span className="flex items-center gap-xs text-body-strong text-emerald-400">
                <span className="w-[6px] h-[6px] rounded-full bg-emerald-400 inline-block" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between py-xs border-t border-hairline">
              <span className="text-caption text-mute">Data Store</span>
              <span className="flex items-center gap-xs text-body-strong text-emerald-400">
                <span className="w-[6px] h-[6px] rounded-full bg-emerald-400 inline-block" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-xs border-t border-hairline">
              <span className="text-caption text-mute">Auth</span>
              <span className="flex items-center gap-xs text-body-strong text-emerald-400">
                <span className="w-[6px] h-[6px] rounded-full bg-emerald-400 inline-block" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-xs border-t border-hairline">
              <span className="text-caption text-mute">Last Updated</span>
              <span className="flex items-center gap-xs text-caption text-mute">
                <Clock size={12} />
                {lastUpdated
                  ? lastUpdated.toLocaleDateString() + " " + lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "This session"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Version History */}
        <div className="card p-lg">
          <div className="flex items-center gap-sm mb-md">
            <History size={18} className="text-amber-400" />
            <h2 className="text-subheading text-ink m-0">Recent Versions</h2>
            {data.versionHistory.length > 0 && (
              <span className="badge text-mute bg-surface-raised ml-auto">{data.versionHistory.length}</span>
            )}
          </div>
          {recentHistory.length > 0 ? (
            <div className="flex flex-col gap-sm">
              {recentHistory.map((entry, i) => (
                <div key={`${entry.versionCode}-${i}`} className="flex items-center gap-sm p-sm rounded-md bg-surface-raised/30 border border-hairline">
                  <div className="w-[24px] h-[24px] rounded-md bg-surface flex items-center justify-center flex-shrink-0">
                    <RefreshCw size={12} className="text-mute" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-xs">
                      <span className="text-body-strong text-ink">v{entry.versionName}</span>
                      <span className="badge text-mute bg-surface">code {entry.versionCode}</span>
                    </div>
                    <div className="text-caption text-mute">
                      {new Date(entry.archivedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-lg text-mute">
              <ListOrdered size={24} className="mb-xs opacity-40" />
              <p className="text-caption">No archived versions yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-lg">
          <div className="flex items-center gap-sm mb-md">
            <Zap size={18} className="text-warning" />
            <h2 className="text-subheading text-ink m-0">Quick Actions</h2>
          </div>
          <div className="flex flex-col gap-sm">
            {[
              { label: "New Announcement", href: "/admin/announcements", icon: Megaphone, desc: "Post a dashboard notification" },
              { label: "Add Server", href: "/admin/servers", icon: Server, desc: "Register a hosted server" },
              { label: "Update Version", href: "/admin/updates", icon: RefreshCw, desc: "Push a new app release" },
              { label: "Open API Docs", href: "/admin/api-docs", icon: ExternalLink, desc: "View available endpoints" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-sm p-sm rounded-md hover:bg-surface-raised transition-colors group"
                >
                  <div className="w-[32px] h-[32px] rounded-md bg-surface-raised flex items-center justify-center flex-shrink-0 group-hover:bg-accent-soft transition-colors">
                    <Icon size={16} className="text-mute group-hover:text-accent transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-strong text-ink">{action.label}</div>
                    <div className="text-caption text-mute">{action.desc}</div>
                  </div>
                  <ArrowUpRight size={14} className="text-mute flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
