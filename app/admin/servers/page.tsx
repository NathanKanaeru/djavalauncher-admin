"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { HostedServer } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Server, Plus, Pencil, Trash2, Globe, Users, Search, Wifi, X } from "lucide-react";

const emptyForm = (): HostedServer => ({
  ip: "", port: 7777, hostname: "", players: 0, maxplayers: 100,
  description: "", mode: "", language: "English", featuredBanner: "",
});

export default function ServersPage() {
  const [servers, setServers] = useState<HostedServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<HostedServer>(emptyForm());
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { const res = await fetch("/api/admin/data"); const d = await res.json(); setServers(d.hostedServers || []); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }

  function startEdit(index: number) { setEditingIndex(index); setShowForm(true); setForm({ ...servers[index] }); }
  function startAdd() { setEditingIndex(null); setShowForm(true); setForm(emptyForm()); }
  function cancelEdit() { setEditingIndex(null); setShowForm(false); setForm(emptyForm()); }
  function update(field: keyof HostedServer, value: string | number) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSave() {
    let updated: HostedServer[];
    if (editingIndex !== null) { updated = servers.map((s, i) => (i === editingIndex ? { ...form, id: s.id } : s)); }
    else { updated = [...servers, { ...form, id: uuidv4() }]; }
    await persist(updated);
  }

  async function handleDelete(index: number) { await persist(servers.filter((_, i) => i !== index)); }

  async function persist(updated: HostedServer[]) {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.hostedServers = updated;
      const res = await fetch("/api/admin/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(current) });
      if (res.ok) { setServers(updated); setEditingIndex(null); setShowForm(false); setForm(emptyForm()); toast.success("Saved"); }
      else { toast.error("Failed to save"); }
    } catch { toast.error("Connection error"); }
  }

  const filtered = servers.filter(s =>
    !search || s.hostname.toLowerCase().includes(search.toLowerCase()) || s.ip.includes(search)
  );

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="w-[200px] h-[16px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="card p-lg">
          <div className="flex gap-md mb-md">
            <div className="w-[240px] h-[36px] bg-surface-raised rounded-sm animate-skeleton" />
            <div className="w-[120px] h-[36px] bg-surface-raised rounded-sm animate-skeleton ml-auto" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-md py-sm border-b border-hairline">
              <div className="flex-[2] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="flex-1 h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="w-[60px] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="w-[80px] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="w-[60px] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Toaster position="top-center" toastOptions={{ style: { background: "#111", color: "#ededed", border: "1px solid #222" } }} />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-lg">
        <div>
          <h1 className="text-display text-ink m-0 flex items-center gap-sm">
            <Server size={28} className="text-accent" />
            Hosted Servers
          </h1>
          <p className="text-body text-mute mt-xxs">Manage SA-MP server listings</p>
        </div>
        <button className="btn-primary flex items-center gap-xs self-start" onClick={startAdd}>
          <Plus size={16} /> Add Server
        </button>
      </div>

      {/* ── Empty State ── */}
      {servers.length === 0 && !editingIndex ? (
        <div className="card p-3xl flex flex-col items-center justify-center text-center animate-fade-in min-h-[320px]">
          <div className="w-[64px] h-[64px] rounded-xl bg-surface-raised flex items-center justify-center mb-md">
            <Server size={32} className="text-mute" />
          </div>
          <p className="text-heading text-body m-0">No servers yet</p>
          <p className="text-body text-mute mt-xs mb-lg max-w-[360px]">
            Add your first hosted SA-MP server to display on the launcher
          </p>
          <button className="btn-primary flex items-center gap-xs" onClick={startAdd}>
            <Plus size={16} /> Add Server
          </button>
        </div>
      ) : (
        <>
          {/* ── Search Bar ── */}
          <div className="flex items-center gap-sm mb-md">
            <div className="relative flex-1 max-w-[360px]">
              <Search size={16} className="absolute left-sm top-1/2 -translate-y-1/2 text-mute pointer-events-none" />
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
              {filtered.length} of {servers.length}
            </span>
          </div>

          {/* ── Data Table ── */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-[35%]">Hostname</th>
                    <th className="w-[20%]">IP:Port</th>
                    <th className="w-[10%]">Players</th>
                    <th className="w-[15%]">Mode</th>
                    <th className="w-[10%]">Language</th>
                    <th className="w-[10%] text-right">Actions</th>
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
                            <div className="text-body-strong text-ink truncate">{server.hostname || server.ip}</div>
                            {server.description && (
                              <div className="text-caption text-mute truncate max-w-[200px]">{server.description}</div>
                            )}
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
                      <td>
                        <span className="badge">{server.language}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-xs">
                          {server.featuredBanner && (
                            <Globe size={14} className="text-accent" aria-label="Has banner" />
                          )}
                          <button className="btn-ghost p-xs" onClick={() => startEdit(index)} title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn-ghost p-xs text-error hover:bg-error-soft"
                            onClick={() => handleDelete(index)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-md" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="card p-xl max-w-[600px] w-full animate-scale-in relative z-50" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <h2 className="text-heading text-ink m-0 mb-lg">
              {editingIndex !== null ? "Edit Server" : "New Server"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div>
                <label className="label">IP Address</label>
                <input className="input w-full" value={form.ip} onChange={(e) => update("ip", e.target.value)} placeholder="127.0.0.1" />
              </div>
              <div>
                <label className="label">Port</label>
                <input className="input w-full" type="number" value={form.port} onChange={(e) => update("port", parseInt(e.target.value) || 0)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Hostname</label>
                <input className="input w-full" value={form.hostname} onChange={(e) => update("hostname", e.target.value)} placeholder="My SA-MP Server" />
              </div>
              <div>
                <label className="label">Players</label>
                <input className="input w-full" type="number" value={form.players} onChange={(e) => update("players", parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">Max Players</label>
                <input className="input w-full" type="number" value={form.maxplayers} onChange={(e) => update("maxplayers", parseInt(e.target.value) || 0)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea className="textarea w-full" value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} placeholder="Server description..." />
              </div>
              <div>
                <label className="label">Mode</label>
                <input className="input w-full" value={form.mode} onChange={(e) => update("mode", e.target.value)} placeholder="Roleplay, Deathmatch, etc." />
              </div>
              <div>
                <label className="label">Language</label>
                <input className="input w-full" value={form.language} onChange={(e) => update("language", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Featured Banner URL</label>
                <input className="input w-full" value={form.featuredBanner} onChange={(e) => update("featuredBanner", e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div className="flex items-center justify-end gap-sm mt-lg pt-md border-t border-hairline">
              <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
              <button className="btn-primary flex items-center gap-xs" onClick={handleSave}>
                <Plus size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
