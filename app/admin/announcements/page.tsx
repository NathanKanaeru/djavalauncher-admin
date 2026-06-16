"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Announcement } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Megaphone, Plus, Pencil, Trash2, Calendar, Image, Inbox, ExternalLink } from "lucide-react";

const emptyForm = () => ({ title: "", description: "", date: new Date().toISOString().split("T")[0], imageUrl: "" });

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Announcement>(emptyForm());

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/data");
      const d = await res.json();
      setAnnouncements(d.announcements || []);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }

  function startEdit(index: number) { setEditingIndex(index); setShowForm(true); setForm({ ...announcements[index] }); }
  function startAdd() { setEditingIndex(null); setShowForm(true); setForm(emptyForm()); }
  function cancelEdit() { setEditingIndex(null); setShowForm(false); setForm(emptyForm()); }
  function update(field: keyof Announcement, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSave() {
    let updated: Announcement[];
    if (editingIndex !== null) { updated = announcements.map((a, i) => (i === editingIndex ? { ...form, id: a.id } : a)); }
    else { updated = [...announcements, { ...form, id: uuidv4() }]; }
    await persist(updated);
  }

  async function handleDelete(index: number) { await persist(announcements.filter((_, i) => i !== index)); }

  async function persist(updated: Announcement[]) {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.announcements = updated;
      const res = await fetch("/api/admin/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(current) });
      if (res.ok) { setAnnouncements(updated); setEditingIndex(null); setShowForm(false); setForm(emptyForm()); toast.success("Saved"); }
      else { toast.error("Failed to save"); }
    } catch { toast.error("Connection error"); }
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="w-[200px] h-[16px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="flex flex-col gap-sm">
          {[1, 2].map((i) => (
            <div key={i} className="card p-lg">
              <div className="flex gap-md">
                <div className="w-[64px] h-[64px] bg-surface-raised rounded-lg animate-skeleton flex-shrink-0" />
                <div className="flex-1">
                  <div className="w-[160px] h-[14px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
                  <div className="w-full h-[10px] bg-surface-raised rounded-sm animate-skeleton mb-xxs" />
                  <div className="w-[60%] h-[10px] bg-surface-raised rounded-sm animate-skeleton mb-sm" />
                  <div className="w-[80px] h-[10px] bg-surface-raised rounded-sm animate-skeleton" />
                </div>
              </div>
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
            <Megaphone size={28} className="text-accent" />
            Announcements
          </h1>
          <p className="text-body text-mute mt-xxs">Manage in-app announcements and news</p>
        </div>
        <button className="btn-primary flex items-center gap-xs self-start" onClick={startAdd}>
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {/* ── Empty State ── */}
      {announcements.length === 0 && !editingIndex && (
        <div className="card p-3xl flex flex-col items-center justify-center text-center animate-fade-in min-h-[320px]">
          <div className="w-[64px] h-[64px] rounded-xl bg-surface-raised flex items-center justify-center mb-md">
            <Inbox size={32} className="text-mute" />
          </div>
          <p className="text-heading text-body m-0">No announcements yet</p>
          <p className="text-body text-mute mt-xs mb-lg max-w-[360px]">
            Create your first announcement to display on the launcher dashboard
          </p>
          <button className="btn-primary flex items-center gap-xs" onClick={startAdd}>
            <Plus size={16} /> Create Announcement
          </button>
        </div>
      )}

      {/* ── Announcement List ── */}
      <div className="flex flex-col gap-sm">
        {announcements.map((item, index) => (
          <div
            key={item.id || index}
            className="card card-hover p-lg animate-slide-in"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex gap-md items-start">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-[80px] h-[80px] rounded-lg object-cover flex-shrink-0 border border-hairline"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-sm">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-subheading text-ink m-0 truncate">{item.title}</h3>
                    <p className="text-body text-body mt-xs mb-sm break-words line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex gap-xs flex-shrink-0">
                    <button className="btn-ghost p-xs" onClick={() => startEdit(index)} title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button className="btn-ghost p-xs text-error hover:bg-error-soft" onClick={() => handleDelete(index)} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-md text-caption text-mute">
                  <span className="flex items-center gap-xxs">
                    <Calendar size={12} /> {item.date}
                  </span>
                  {item.imageUrl && (
                    <span className="flex items-center gap-xxs">
                      <Image size={12} /> Has image
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-md" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="card p-xl max-w-[560px] w-full animate-scale-in relative z-50" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <h2 className="text-heading text-ink m-0 mb-lg">
              {editingIndex !== null ? "Edit Announcement" : "New Announcement"}
            </h2>

            <div className="flex flex-col gap-md">
              <div>
                <label className="label">Title</label>
                <input className="input w-full" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Announcement title" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="textarea w-full" value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} placeholder="What's this announcement about?" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="label flex items-center gap-xxs">
                    <Calendar size={12} className="text-mute" /> Date
                  </label>
                  <input className="input w-full" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
                </div>
                <div>
                  <label className="label flex items-center gap-xxs">
                    <Image size={12} className="text-mute" /> Image URL
                  </label>
                  <input className="input w-full" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." />
                </div>
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
