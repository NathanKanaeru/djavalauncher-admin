"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const initialForm = {
  latestVersionCode: 130,
  latestVersion: "",
  downloadUrl: "",
  changeLog: "",
};

export default function UpdatesPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/data")
      .then((r) => r.json())
      .then((d) => setForm(d.version || initialForm))
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.version = form;
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) toast.success("Version updated");
      else toast.error("Failed to save");
    } catch {
      toast.error("Connection error");
    } finally {
      setSaving(false);
    }
  }

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
        App Updates
      </h1>

      <form onSubmit={handleSave} className="card" style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 20 }}>
          <label className="label">Version Code (integer)</label>
          <input
            type="number"
            className="input-field"
            value={form.latestVersionCode}
            onChange={(e) => update("latestVersionCode", parseInt(e.target.value) || 0)}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Version Name</label>
          <input
            type="text"
            className="input-field"
            value={form.latestVersion}
            onChange={(e) => update("latestVersion", e.target.value)}
            placeholder="e.g. 1.0"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Download URL</label>
          <input
            type="text"
            className="input-field"
            value={form.downloadUrl}
            onChange={(e) => update("downloadUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Change Log</label>
          <textarea
            className="textarea-field"
            value={form.changeLog}
            onChange={(e) => update("changeLog", e.target.value)}
            placeholder="What's new in this version?"
            rows={4}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
