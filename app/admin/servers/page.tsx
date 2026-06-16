"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ServerEntry } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import {
  Server,
  Plus,
  Trash2,
  Users,
  Search,
  Wifi,
  X,
  Crown,
  Star,
  Loader2,
  Pencil,
} from "lucide-react";

export default function ServersPage() {
  const [officialServer, setOfficialServer] = useState<ServerEntry | null>(null);
  const [featuredServers, setFeaturedServers] = useState<ServerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [officialIp, setOfficialIp] = useState("");
  const [officialPort, setOfficialPort] = useState("7777");
  const [officialCustomName, setOfficialCustomName] = useState("");
  const [officialDescription, setOfficialDescription] = useState("");
  const [officialBannerUrl, setOfficialBannerUrl] = useState("");
  const [officialPreview, setOfficialPreview] = useState<Omit<ServerEntry, "id"> | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const [showFeaturedForm, setShowFeaturedForm] = useState(false);
  const [featuredIp, setFeaturedIp] = useState("");
  const [featuredPort, setFeaturedPort] = useState("7777");
  const [featuredQueryLoading, setFeaturedQueryLoading] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/data");
      const d = await res.json();
      setOfficialServer(d.officialServer || null);
      setFeaturedServers(d.featuredServers || []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function fetchOfficialDetails() {
    if (!officialIp) { toast.error("Enter an IP address"); return; }
    setQueryLoading(true);
    setOfficialPreview(null);
    try {
      const res = await fetch("/api/admin/server-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: officialIp, port: parseInt(officialPort) || 7777 }),
      });
      if (!res.ok) { const e = await res.json(); toast.error(e.error || "Query failed"); return; }
      const data = await res.json();
      setOfficialPreview(data);
      toast.success("Server details fetched");
    } catch {
      toast.error("Connection error");
    } finally {
      setQueryLoading(false);
    }
  }

  async function saveOfficial() {
    if (!officialPreview && !officialServer) { toast.error("Fetch server details first"); return; }
    const entry: ServerEntry = officialPreview
      ? {
          ...officialPreview,
          id: uuidv4(),
          customName: officialCustomName || undefined,
          description: officialDescription || undefined,
          bannerUrl: officialBannerUrl || undefined,
        }
      : officialServer!;
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.officialServer = entry;
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) {
        setOfficialServer(entry);
        setOfficialIp("");
        setOfficialPort("7777");
        setOfficialCustomName("");
        setOfficialDescription("");
        setOfficialBannerUrl("");
        setOfficialPreview(null);
        toast.success("Official server saved");
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Connection error");
    }
  }

  async function removeOfficial() {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.officialServer = null;
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) {
        setOfficialServer(null);
        toast.success("Official server removed");
      } else {
        toast.error("Failed to remove");
      }
    } catch {
      toast.error("Connection error");
    }
  }

  async function fetchFeaturedDetails() {
    if (!featuredIp) { toast.error("Enter an IP address"); return; }
    setFeaturedQueryLoading(true);
    try {
      const res = await fetch("/api/admin/server-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: featuredIp, port: parseInt(featuredPort) || 7777 }),
      });
      if (!res.ok) { const e = await res.json(); toast.error(e.error || "Query failed"); return; }
      const data = await res.json();
      const entry: ServerEntry = { ...data, id: uuidv4() };
      const updated = [...featuredServers, entry];
      await persistFeatured(updated);
      setFeaturedIp("");
      setFeaturedPort("7777");
      setShowFeaturedForm(false);
      toast.success("Featured server added");
    } catch {
      toast.error("Connection error");
    } finally {
      setFeaturedQueryLoading(false);
    }
  }

  async function handleDeleteFeatured(index: number) {
    const updated = featuredServers.filter((_, i) => i !== index);
    await persistFeatured(updated);
  }

  async function persistFeatured(updated: ServerEntry[]) {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.featuredServers = updated;
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) {
        setFeaturedServers(updated);
        toast.success("Saved");
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Connection error");
    }
  }

  const filtered = featuredServers.filter(
    (s) =>
      !search ||
      s.hostname.toLowerCase().includes(search.toLowerCase()) ||
      s.ip.includes(search)
  );

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="w-[200px] h-[16px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="card p-lg">
          <div className="w-[240px] h-[36px] bg-surface-raised rounded-sm animate-skeleton mb-md" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-md py-sm border-b border-hairline">
              <div className="flex-[2] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="flex-1 h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="w-[60px] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="w-[60px] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="w-[60px] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-xl">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#111", color: "#ededed", border: "1px solid #222" },
        }}
      />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
        <div>
          <h1 className="text-display text-ink m-0 flex items-center gap-sm">
            <Server size={28} className="text-accent" />
            Servers
          </h1>
          <p className="text-body text-mute mt-xxs">
            Manage official and featured SA-MP server listings
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* OFFICIAL SERVER SECTION                */}
      {/* ════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-sm mb-md">
          <Crown size={20} className="text-warning" />
          <h2 className="text-heading text-ink m-0">Official Server</h2>
        </div>

        {officialServer ? (
          <div className="card p-lg animate-fade-in">
            <div className="flex items-start justify-between gap-md">
              <div className="flex items-center gap-md min-w-0">
                <div className="w-[44px] h-[44px] rounded-xl bg-warning-soft flex items-center justify-center flex-shrink-0">
                  <Crown size={22} className="text-warning" />
                </div>
                <div className="min-w-0">
                  <div className="text-heading text-ink truncate">
                    {officialServer.customName || officialServer.hostname}
                  </div>
                  {officialServer.customName && (
                    <div className="text-caption text-mute truncate">{officialServer.hostname}</div>
                  )}
                  <code className="text-caption-mono text-accent bg-surface-raised rounded-xs px-xs py-xxs inline-block mt-xs">
                    {officialServer.ip}:{officialServer.port}
                  </code>
                  <div className="flex items-center gap-md mt-sm text-caption text-mute">
                    <span className="flex items-center gap-xxs">
                      <Users size={12} />
                      {officialServer.players}/{officialServer.maxplayers}
                    </span>
                    <span>{officialServer.mode}</span>
                    <span className="badge">{officialServer.language || "N/A"}</span>
                  </div>
                  {officialServer.description && (
                    <div className="text-body text-mute mt-sm max-w-[480px]">
                      {officialServer.description}
                    </div>
                  )}
                  {officialServer.bannerUrl && (
                    <div className="mt-sm">
                      <a href={officialServer.bannerUrl} target="_blank" rel="noopener noreferrer" className="text-caption text-accent hover:underline inline-flex items-center gap-xxs">
                        View Banner &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-xs flex-shrink-0">
                <button
                  className="btn-secondary text-sm"
                  onClick={() => {
                    setOfficialIp(officialServer.ip);
                    setOfficialPort(String(officialServer.port));
                    setOfficialCustomName(officialServer.customName || "");
                    setOfficialDescription(officialServer.description || "");
                    setOfficialBannerUrl(officialServer.bannerUrl || "");
                    setOfficialPreview(officialServer);
                    setOfficialServer(null);
                  }}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button className="btn-ghost text-error text-sm p-xs" onClick={removeOfficial}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-lg animate-fade-in">
            <p className="text-body text-mute mb-md">
              Set your main official server. Enter the IP and port, then fetch details automatically.
            </p>
            <div className="flex flex-wrap items-end gap-sm mb-md">
              <div className="flex-1 min-w-[180px]">
                <label className="label">IP Address</label>
                <input
                  className="input w-full"
                  value={officialIp}
                  onChange={(e) => setOfficialIp(e.target.value)}
                  placeholder="127.0.0.1"
                />
              </div>
              <div className="w-[120px]">
                <label className="label">Port</label>
                <input
                  className="input w-full"
                  type="number"
                  value={officialPort}
                  onChange={(e) => setOfficialPort(e.target.value)}
                />
              </div>
              <button
                className="btn-secondary flex items-center gap-xs"
                onClick={fetchOfficialDetails}
                disabled={queryLoading}
              >
                {queryLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Wifi size={14} />
                )}
                Fetch Details
              </button>
            </div>

            {officialPreview && (
              <div className="bg-surface-raised rounded-lg p-md border border-hairline mb-md animate-fade-in">
                <div className="text-caption text-mute mb-sm">Server Details (auto-fetched)</div>
                <div className="flex items-center gap-md flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="text-body-strong text-ink truncate">
                      {officialPreview.hostname}
                    </div>
                    <code className="text-caption-mono text-accent">
                      {officialPreview.ip}:{officialPreview.port}
                    </code>
                  </div>
                  <span className="flex items-center gap-xxs text-body text-mute">
                    <Users size={12} />
                    {officialPreview.players}/{officialPreview.maxplayers}
                  </span>
                  <span className="text-body text-mute">{officialPreview.mode}</span>
                  <span className="badge">{officialPreview.language || "N/A"}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-md">
              <div className="sm:col-span-2">
                <label className="label">Custom Name (optional)</label>
                <input
                  className="input w-full"
                  value={officialCustomName}
                  onChange={(e) => setOfficialCustomName(e.target.value)}
                  placeholder="My Official Server"
                />
                <p className="text-caption text-mute mt-xxs">Override the auto-fetched hostname for display</p>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description (optional)</label>
                <textarea
                  className="textarea w-full"
                  value={officialDescription}
                  onChange={(e) => setOfficialDescription(e.target.value)}
                  rows={2}
                  placeholder="Server description for the launcher..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Banner URL (optional)</label>
                <input
                  className="input w-full"
                  value={officialBannerUrl}
                  onChange={(e) => setOfficialBannerUrl(e.target.value)}
                  placeholder="https://example.com/banner.png"
                />
                {officialBannerUrl && (
                  <div className="mt-xs">
                    <img
                      src={officialBannerUrl}
                      alt="Banner preview"
                      className="max-h-[120px] rounded-md border border-hairline"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn-primary flex items-center gap-xs"
              onClick={saveOfficial}
              disabled={!officialPreview && !officialServer}
            >
              <Plus size={14} /> Save Official Server
            </button>
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════ */}
      {/* FEATURED SERVERS SECTION               */}
      {/* ════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between gap-sm mb-md">
          <div className="flex items-center gap-sm">
            <Star size={20} className="text-accent" />
            <h2 className="text-heading text-ink m-0">Featured Servers</h2>
          </div>
          <button
            className="btn-primary flex items-center gap-xs"
            onClick={() => setShowFeaturedForm(true)}
          >
            <Plus size={16} /> Add Featured
          </button>
        </div>

        {featuredServers.length === 0 ? (
          <div className="card p-3xl flex flex-col items-center justify-center text-center animate-fade-in min-h-[200px]">
            <div className="w-[48px] h-[48px] rounded-xl bg-surface-raised flex items-center justify-center mb-md">
              <Star size={24} className="text-mute" />
            </div>
            <p className="text-body-strong text-ink m-0">No featured servers</p>
            <p className="text-body text-mute mt-xs mb-lg max-w-[360px]">
              Add partner or featured servers to display on the launcher
            </p>
            <button
              className="btn-primary flex items-center gap-xs"
              onClick={() => setShowFeaturedForm(true)}
            >
              <Plus size={16} /> Add Featured Server
            </button>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="flex items-center gap-sm mb-md">
              <div className="relative flex-1 max-w-[360px]">
                <Search
                  size={16}
                  className="absolute left-sm top-1/2 -translate-y-1/2 text-mute pointer-events-none"
                />
                <input
                  className="input w-full pl-xl pr-lg"
                  placeholder="Search by hostname or IP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-mute hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <span className="text-caption text-mute flex-shrink-0">
                {filtered.length} of {featuredServers.length}
              </span>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-[35%]">Hostname</th>
                      <th className="w-[20%]">IP:Port</th>
                      <th className="w-[12%]">Players</th>
                      <th className="w-[18%]">Mode</th>
                      <th className="w-[15%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((server, index) => (
                      <tr key={server.id || index}>
                        <td>
                          <div className="flex items-center gap-sm">
                            <div className="w-[28px] h-[28px] rounded-md bg-accent-soft flex items-center justify-center flex-shrink-0">
                              <Wifi size={14} className="text-accent" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-body-strong text-ink truncate">
                                {server.hostname || server.ip}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code className="text-caption-mono text-body bg-surface-raised rounded-xs px-xs py-xxs">
                            {server.ip}:{server.port}
                          </code>
                        </td>
                        <td>
                          <span className="flex items-center gap-xxs text-body">
                            <Users size={12} className="text-mute" />
                            {server.players}/{server.maxplayers}
                          </span>
                        </td>
                        <td className="text-mute">{server.mode || "\u2014"}</td>
                        <td className="text-right">
                          <button
                            className="btn-ghost p-xs text-error hover:bg-error-soft"
                            onClick={() => handleDeleteFeatured(index)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Add Featured Modal ── */}
      {showFeaturedForm && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-md"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="card p-xl max-w-[480px] w-full animate-scale-in relative z-50"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 className="text-heading text-ink m-0 mb-lg">Add Featured Server</h2>

            <div className="flex flex-wrap items-end gap-sm mb-md">
              <div className="flex-1 min-w-[180px]">
                <label className="label">IP Address</label>
                <input
                  className="input w-full"
                  value={featuredIp}
                  onChange={(e) => setFeaturedIp(e.target.value)}
                  placeholder="127.0.0.1"
                />
              </div>
              <div className="w-[120px]">
                <label className="label">Port</label>
                <input
                  className="input w-full"
                  type="number"
                  value={featuredPort}
                  onChange={(e) => setFeaturedPort(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-sm mt-lg pt-md border-t border-hairline">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowFeaturedForm(false);
                  setFeaturedIp("");
                  setFeaturedPort("7777");
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary flex items-center gap-xs"
                onClick={fetchFeaturedDetails}
                disabled={featuredQueryLoading}
              >
                {featuredQueryLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Wifi size={14} />
                )}
                Fetch &amp; Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
