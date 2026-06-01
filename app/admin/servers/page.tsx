"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { HostedServer } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const emptyForm = (): HostedServer => ({
  ip: "",
  port: 7777,
  hostname: "",
  players: 0,
  maxplayers: 100,
  description: "",
  mode: "",
  language: "English",
  featuredBanner: "",
});

export default function ServersPage() {
  const [servers, setServers] = useState<HostedServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<HostedServer>(emptyForm());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/data");
      const d = await res.json();
      setServers(d.hostedServers || []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setShowForm(true);
    setForm({ ...servers[index] });
  }

  function startAdd() {
    setEditingIndex(null);
    setShowForm(true);
    setForm(emptyForm());
  }

  function cancelEdit() {
    setEditingIndex(null);
    setShowForm(false);
    setForm(emptyForm());
  }

  function update(field: keyof HostedServer, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    let updated: HostedServer[];
    if (editingIndex !== null) {
      updated = servers.map((s, i) => (i === editingIndex ? { ...form, id: s.id } : s));
    } else {
      updated = [...servers, { ...form, id: uuidv4() }];
    }
    await persist(updated);
  }

  async function handleDelete(index: number) {
    const updated = servers.filter((_, i) => i !== index);
    await persist(updated);
  }

  async function persist(updated: HostedServer[]) {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.hostedServers = updated;
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) {
        setServers(updated);
        setEditingIndex(null);
        setShowForm(false);
        setForm(emptyForm());
        toast.success("Saved");
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Connection error");
    }
  }

  if (loading) return <div style={{ color: "#cac4d0" }}>Loading...</div>;

  return (
    <div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#2b2930", color: "#e6e1e5", border: "1px solid #49454f" },
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500, margin: 0, color: "#e6e1e5" }}>
          Hosted Servers
        </h1>
        <button className="btn-primary" onClick={startAdd} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          + Add Server
        </button>
      </div>

      {servers.length === 0 && editingIndex === null && (
        <div className="card" style={{ textAlign: "center", color: "#cac4d0", padding: 48 }}>
          No servers yet. Click "+ Add Server" to add one.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {servers.map((server, index) => (
          <div key={server.id || index} className="card-outlined">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 500, color: "#e6e1e5", fontSize: 16 }}>
                  {server.hostname || server.ip}
                </div>
                <div style={{ fontSize: 13, color: "#cac4d0", marginTop: 2 }}>
                  {server.ip}:{server.port} {server.mode ? `| ${server.mode}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => startEdit(index)}>Edit</button>
                <button className="btn-error" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleDelete(index)}>Del</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#938f99", flexWrap: "wrap" }}>
              <span>Players: {server.players}/{server.maxplayers}</span>
              <span>Lang: {server.language}</span>
              {server.featuredBanner && <span>Has banner</span>}
            </div>
            {server.description && (
              <div style={{ fontSize: 13, color: "#cac4d0", marginTop: 6 }}>{server.description}</div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card" style={{ marginTop: 24, maxWidth: 640 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 16px", color: "#e6e1e5" }}>
            {editingIndex !== null ? "Edit Server" : "New Server"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="label">IP Address</label>
              <input className="input-field" value={form.ip} onChange={(e) => update("ip", e.target.value)} />
            </div>
            <div>
              <label className="label">Port</label>
              <input className="input-field" type="number" value={form.port} onChange={(e) => update("port", parseInt(e.target.value) || 0)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Hostname</label>
              <input className="input-field" value={form.hostname} onChange={(e) => update("hostname", e.target.value)} />
            </div>
            <div>
              <label className="label">Players</label>
              <input className="input-field" type="number" value={form.players} onChange={(e) => update("players", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="label">Max Players</label>
              <input className="input-field" type="number" value={form.maxplayers} onChange={(e) => update("maxplayers", parseInt(e.target.value) || 0)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Description</label>
              <textarea className="textarea-field" value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} />
            </div>
            <div>
              <label className="label">Mode</label>
              <input className="input-field" value={form.mode} onChange={(e) => update("mode", e.target.value)} />
            </div>
            <div>
              <label className="label">Language</label>
              <input className="input-field" value={form.language} onChange={(e) => update("language", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Featured Banner URL (optional)</label>
              <input className="input-field" value={form.featuredBanner} onChange={(e) => update("featuredBanner", e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button className="btn-primary" onClick={handleSave}>Save</button>
            <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
