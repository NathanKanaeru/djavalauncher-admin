"use client";

import { useEffect, useState } from "react";
import { AppData } from "@/lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    fetch("/api/admin/data")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return <div style={{ color: "#cac4d0" }}>Loading...</div>;
  }

  const stats = [
    {
      label: "Announcements",
      value: data.announcements.length,
      icon: "📢",
      color: "#d0bcff",
    },
    {
      label: "Hosted Servers",
      value: data.hostedServers.length,
      icon: "🖥️",
      color: "#ccc2dc",
    },
    {
      label: "App Version",
      value: `v${data.version.latestVersion}`,
      icon: "🔄",
      color: "#b4d0ff",
    },
    {
      label: "Game Data Sources",
      value: "3",
      icon: "🗄️",
      color: "#efb8c8",
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 500, margin: "0 0 24px", color: "#e6e1e5" }}>
        Dashboard
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {stats.map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "20px" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 13, color: "#cac4d0", marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 16px", color: "#e6e1e5" }}>
          Quick Info
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: 14 }}>
          <span style={{ color: "#cac4d0" }}>Latest Version:</span>
          <span style={{ color: "#e6e1e5" }}>{data.version.latestVersion} (code {data.version.latestVersionCode})</span>
          <span style={{ color: "#cac4d0" }}>Download URL:</span>
          <span style={{ color: "#d0bcff", wordBreak: "break-all" }}>{data.version.downloadUrl || "—"}</span>
          <span style={{ color: "#cac4d0" }}>Change Log:</span>
          <span style={{ color: "#e6e1e5" }}>{data.version.changeLog || "—"}</span>
          <span style={{ color: "#cac4d0" }}>Hosted Servers:</span>
          <span style={{ color: "#e6e1e5" }}>{data.hostedServers.length} total</span>
          <span style={{ color: "#cac4d0" }}>Announcements:</span>
          <span style={{ color: "#e6e1e5" }}>{data.announcements.length} total</span>
          <span style={{ color: "#cac4d0" }}>Game Data Sources:</span>
          <span style={{ color: "#e6e1e5" }}>GitHub / Pixeldrain / Dropbox</span>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 16px", color: "#e6e1e5" }}>
          API Endpoints
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
          <div><code style={{ color: "#d0bcff", background: "rgba(208,188,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>GET /api/version_control</code> <span style={{ color: "#cac4d0" }}>— App version check</span></div>
          <div><code style={{ color: "#d0bcff", background: "rgba(208,188,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>GET /api/announcements</code> <span style={{ color: "#cac4d0" }}>— Dashboard announcements</span></div>
          <div><code style={{ color: "#d0bcff", background: "rgba(208,188,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>GET /api/hosted</code> <span style={{ color: "#cac4d0" }}>— Server list</span></div>
          <div><code style={{ color: "#d0bcff", background: "rgba(208,188,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>GET /api/download_sources</code> <span style={{ color: "#cac4d0" }}>— Game data download URLs</span></div>
        </div>
      </div>
    </div>
  );
}
