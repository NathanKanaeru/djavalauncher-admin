"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Announcement } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const emptyForm = () => ({
  title: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  imageUrl: "",
});

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Announcement>(emptyForm());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/data");
      const d = await res.json();
      setAnnouncements(d.announcements || []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setShowForm(true);
    setForm({ ...announcements[index] });
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

  function update(field: keyof Announcement, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    let updated: Announcement[];
    if (editingIndex !== null) {
      updated = announcements.map((a, i) => (i === editingIndex ? { ...form, id: a.id } : a));
    } else {
      updated = [...announcements, { ...form, id: uuidv4() }];
    }
    await persist(updated);
  }

  async function handleDelete(index: number) {
    const updated = announcements.filter((_, i) => i !== index);
    await persist(updated);
  }

  async function persist(updated: Announcement[]) {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.announcements = updated;
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) {
        setAnnouncements(updated);
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
          Announcements
        </h1>
        <button className="btn-primary" onClick={startAdd} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          + Add
        </button>
      </div>

      {announcements.length === 0 && !editingIndex && (
        <div className="card" style={{ textAlign: "center", color: "#cac4d0", padding: 48 }}>
          No announcements yet. Click "+ Add" to create one.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {announcements.map((item, index) => (
          <div key={item.id || index} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, color: "#e6e1e5", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#cac4d0", marginBottom: 4, wordBreak: "break-word" }}>{item.description}</div>
              <div style={{ fontSize: 12, color: "#938f99" }}>{item.date}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => startEdit(index)}>Edit</button>
              <button className="btn-error" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleDelete(index)}>Del</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card" style={{ marginTop: 24, maxWidth: 640 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 16px", color: "#e6e1e5" }}>
            {editingIndex !== null ? "Edit Announcement" : "New Announcement"}
          </h2>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Title</label>
            <input className="input-field" value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Description</label>
            <textarea className="textarea-field" value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Date</label>
            <input className="input-field" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Image URL</label>
            <input className="input-field" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={handleSave}>Save</button>
            <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
