"use client";

import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GameDataSources } from "@/lib/types";
import { Database, GitBranch, Cloud, ExternalLink, Save, Copy, Check, Globe } from "lucide-react";

const initialForm: GameDataSources = { github: "", pixeldrain: "", dropbox: "" };

const SOURCES = [
  { key: "github" as const, label: "GitHub Release", icon: GitBranch, tag: "Primary", tagColor: "text-accent bg-accent-soft", desc: "Primary download source via GitHub Releases", color: "#0070f3" },
  { key: "pixeldrain" as const, label: "Pixeldrain", icon: Cloud, tag: "Mirror", tagColor: "text-warning bg-warning-soft", desc: "Fast mirror hosted on Pixeldrain", color: "#f5a623" },
  { key: "dropbox" as const, label: "Dropbox", icon: ExternalLink, tag: "Mirror", tagColor: "text-warning bg-warning-soft", desc: "Fast mirror hosted on Dropbox", color: "#888888" },
];

export default function GameDataPage() {
  const [form, setForm] = useState<GameDataSources>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/data").then((r) => r.json()).then((d) => setForm(d.gameDataSources || initialForm)).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, []);

  function update(field: keyof GameDataSources, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.gameDataSources = form;
      const res = await fetch("/api/admin/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(current) });
      if (res.ok) toast.success("Download sources updated");
      else toast.error("Failed to save");
    } catch { toast.error("Connection error"); }
    finally { setSaving(false); }
  }

  const copyUrl = useCallback(async (key: string, url: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch { toast.error("Failed to copy"); }
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in max-w-[960px]">
        <div className="w-[260px] h-[16px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-lg">
              <div className="w-[40px] h-[40px] bg-surface-raised rounded-lg animate-skeleton mb-sm" />
              <div className="w-[120px] h-[14px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
              <div className="w-full h-[36px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
              <div className="w-[80px] h-[10px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[960px]">
      <Toaster position="top-center" toastOptions={{ style: { background: "#111", color: "#ededed", border: "1px solid #222" } }} />

      {/* ── Page Header ── */}
      <div className="mb-lg">
        <h1 className="text-display text-ink m-0 flex items-center gap-sm">
          <Database size={28} className="text-accent" />
          Game Data Download Sources
        </h1>
        <p className="text-body text-mute mt-xxs">Manage download URLs for the SA-MP game data package</p>
      </div>

      {/* ── Source Cards Grid ── */}
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
          {SOURCES.map(({ key, label, icon: Icon, tag, tagColor, desc, color }) => (
            <div
              key={key}
              className="card-accent p-lg flex flex-col"
            >
              {/* Icon Container */}
              <div
                className="w-[44px] h-[44px] rounded-xl flex items-center justify-center mb-md"
                style={{ background: `${color}15` }}
              >
                <Icon size={22} style={{ color }} />
              </div>

              {/* Label + Tag */}
              <div className="flex items-center gap-xs mb-sm">
                <span className="text-body-strong text-ink">{label}</span>
                <span className={`badge ${tagColor}`}>{tag}</span>
              </div>

              {/* Description */}
              <p className="text-caption text-mute mb-sm">{desc}</p>

              {/* URL Input */}
              <div className="flex-1 mb-sm">
                <input
                  type="text"
                  className="input w-full font-mono text-[13px]"
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={`https://${key}...`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-xs pt-sm border-t border-hairline">
                <button
                  type="button"
                  onClick={() => copyUrl(key, form[key])}
                  className="btn-ghost flex items-center gap-xs text-caption flex-1 justify-center"
                  disabled={!form[key]}
                  title="Copy URL"
                >
                  {copiedKey === key ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedKey === key ? "Copied" : "Copy"}
                </button>
                <a
                  href={form[key] || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn-ghost flex items-center gap-xs text-caption flex-1 justify-center ${!form[key] ? "pointer-events-none opacity-40" : ""}`}
                  title="Visit URL"
                >
                  <Globe size={14} />
                  Visit
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-sm">
          <button type="submit" className="btn-primary flex items-center gap-xs" disabled={saving}>
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
