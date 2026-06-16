"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { RefreshCw, Hash, Tag, Link, FileText, Save, History } from "lucide-react";
import { VersionHistoryEntry } from "@/lib/types";

const initialForm = {
  latestVersionCode: 130,
  latestVersion: "",
  downloadUrl: "",
  downloadUrl64: "",
  changeLog: "",
};

export default function UpdatesPage() {
  const [form, setForm] = useState(initialForm);
  const [history, setHistory] = useState<VersionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/data")
      .then((r) => r.json())
      .then((d) => {
        setForm(d.version || initialForm);
        setHistory(d.versionHistory || []);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());

      const prevVersion = current.version;
      if (prevVersion && prevVersion.latestVersion && prevVersion.downloadUrl) {
      const entry: VersionHistoryEntry = {
        versionCode: prevVersion.latestVersionCode,
        versionName: prevVersion.latestVersion,
        downloadUrl: prevVersion.downloadUrl,
        downloadUrl64: prevVersion.downloadUrl64,
        changeLog: prevVersion.changeLog,
        archivedAt: new Date().toISOString(),
      };
        current.versionHistory = [...(current.versionHistory || []), entry];
      }

      current.version = form;
      current.lastUpdatedAt = new Date().toISOString();

      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) {
        toast.success("Version updated — previous version archived");
        setHistory(current.versionHistory || []);
      } else toast.error("Failed to save");
    } catch {
      toast.error("Connection error");
    } finally {
      setSaving(false);
    }
  }

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="animate-fade-in max-w-[720px]">
        <div className="w-[180px] h-[16px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="card p-lg">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-md">
              <div className="w-[100px] h-[10px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
              <div className="w-full h-[40px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[720px]">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#111", color: "#ededed", border: "1px solid #222" },
        }}
      />

      {/* ── Page Header ── */}
      <div className="mb-lg">
        <h1 className="text-display text-ink m-0 flex items-center gap-sm">
          <RefreshCw size={28} className="text-accent" />
          App Updates
        </h1>
        <p className="text-body text-mute mt-xxs">Manage the latest version and download information</p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSave} className="card-accent p-lg">
        {/* Version Section */}
        <div className="mb-lg pb-lg border-b border-hairline">
          <h2 className="text-subheading text-ink m-0 mb-md flex items-center gap-xs">
            <Hash size={16} className="text-accent" />
            Version Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div>
              <label className="label">Version Code</label>
              <input
                type="number"
                className="input w-full"
                value={form.latestVersionCode}
                onChange={(e) => update("latestVersionCode", parseInt(e.target.value) || 0)}
              />
              <p className="text-caption text-mute mt-xxs">Integer version code for app comparison</p>
            </div>
            <div>
              <label className="label">Version Name</label>
              <input
                type="text"
                className="input w-full"
                value={form.latestVersion}
                onChange={(e) => update("latestVersion", e.target.value)}
                placeholder="e.g. 1.0"
              />
              <p className="text-caption text-mute mt-xxs">Human-readable version string</p>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="mb-lg pb-lg border-b border-hairline">
          <h2 className="text-subheading text-ink m-0 mb-md flex items-center gap-xs">
            <Link size={16} className="text-accent" />
            Download
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div>
              <label className="label">Download URL (32-bit)</label>
              <input
                type="text"
                className="input w-full"
                value={form.downloadUrl}
                onChange={(e) => update("downloadUrl", e.target.value)}
                placeholder="https://..."
              />
              <p className="text-caption text-mute mt-xxs">Direct link for 32-bit / universal APK</p>
            </div>
            <div>
              <label className="label">Download URL (64-bit)</label>
              <input
                type="text"
                className="input w-full"
                value={form.downloadUrl64}
                onChange={(e) => update("downloadUrl64", e.target.value)}
                placeholder="https://..."
              />
              <p className="text-caption text-mute mt-xxs">Direct link for 64-bit APK</p>
            </div>
          </div>
        </div>

        {/* Changelog Section */}
        <div className="mb-lg">
          <h2 className="text-subheading text-ink m-0 mb-md flex items-center gap-xs">
            <FileText size={16} className="text-accent" />
            Change Log
          </h2>
          <div>
            <textarea
              className="textarea w-full"
              value={form.changeLog}
              onChange={(e) => update("changeLog", e.target.value)}
              placeholder="What's new in this version?"
              rows={5}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-sm pt-sm border-t border-hairline">
          <button type="submit" className="btn-primary flex items-center gap-xs" disabled={saving}>
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* ── Changelogs ── */}
      {(history.length > 0 || form.changeLog) && (
        <div className="card p-lg mt-lg">
          <div className="flex items-center gap-sm mb-md">
            <FileText size={18} className="text-accent" />
            <h2 className="text-subheading text-ink m-0">Changelogs</h2>
            <span className="badge text-mute bg-surface-raised ml-auto">
              {history.length + (form.changeLog ? 1 : 0)} versions
            </span>
          </div>
          <div className="flex flex-col gap-md">
            {/* Current version (latest, not archived) */}
            {form.changeLog && (
              <div className="card p-md border border-accent/30 bg-accent-soft/30">
                <div className="flex items-center justify-between mb-sm">
                  <div className="flex items-center gap-xs">
                    <span className="text-body-strong text-ink">
                      v{form.latestVersion || "\u2014"}
                    </span>
                    <span className="badge text-accent bg-accent-soft">Current</span>
                    <span className="badge text-mute bg-surface">code {form.latestVersionCode}</span>
                  </div>
                  <span className="text-caption text-mute">Latest release</span>
                </div>
                <div className="text-body text-ink whitespace-pre-wrap">{form.changeLog}</div>
              </div>
            )}

            {/* Archived versions */}
            {[...history].reverse().map((entry, i) => (
              <div key={`${entry.versionCode}-${i}`} className="card p-md">
                <div className="flex items-center justify-between mb-sm">
                  <div className="flex items-center gap-xs">
                    <span className="text-body-strong text-ink">v{entry.versionName}</span>
                    <span className="badge text-mute bg-surface">code {entry.versionCode}</span>
                  </div>
                  <span className="text-caption text-mute">
                    {new Date(entry.archivedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {entry.changeLog && (
                  <div className="text-body text-ink whitespace-pre-wrap">{entry.changeLog}</div>
                )}
                {!entry.changeLog && (
                  <p className="text-caption text-mute italic">No changelog recorded</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!history.length && !form.changeLog && (
        <div className="card p-lg mt-lg">
          <div className="flex flex-col items-center justify-center py-xl text-mute">
            <FileText size={32} className="mb-sm opacity-40" />
            <p className="text-body-strong text-ink mb-xxs">No changelogs yet</p>
            <p className="text-caption">Changelogs will appear here when you publish a version</p>
          </div>
        </div>
      )}
    </div>
  );
}
