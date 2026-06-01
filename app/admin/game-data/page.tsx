"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GameDataSources } from "@/lib/types";

const initialForm: GameDataSources = {
  github: "",
  pixeldrain: "",
  dropbox: "",
};

export default function GameDataPage() {
  const [form, setForm] = useState<GameDataSources>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/data")
      .then((r) => r.json())
      .then((d) => setForm(d.gameDataSources || initialForm))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  function update(field: keyof GameDataSources, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.gameDataSources = form;
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) toast.success("Download sources updated");
      else toast.error("Failed to save");
    } catch {
      toast.error("Connection error");
    } finally {
      setSaving(false);
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

      <h1 style={{ fontSize: 28, fontWeight: 500, margin: "0 0 24px", color: "#e6e1e5" }}>
        Game Data Download Sources
      </h1>

      <form onSubmit={handleSave} className="card" style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 20 }}>
          <label className="label">GitHub Release</label>
          <input
            type="text"
            className="input-field"
            value={form.github}
            onChange={(e) => update("github", e.target.value)}
            placeholder="https://github.com/..."
          />
          <p style={{ fontSize: 12, color: "#938f99", margin: "4px 0 0" }}>Tag: Recommended</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Pixeldrain</label>
          <input
            type="text"
            className="input-field"
            value={form.pixeldrain}
            onChange={(e) => update("pixeldrain", e.target.value)}
            placeholder="https://pixeldrain.com/..."
          />
          <p style={{ fontSize: 12, color: "#938f99", margin: "4px 0 0" }}>Tag: Cepat</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Dropbox</label>
          <input
            type="text"
            className="input-field"
            value={form.dropbox}
            onChange={(e) => update("dropbox", e.target.value)}
            placeholder="https://www.dropbox.com/..."
          />
          <p style={{ fontSize: 12, color: "#938f99", margin: "4px 0 0" }}>Tag: Cepat</p>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
