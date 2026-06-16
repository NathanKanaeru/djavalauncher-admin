"use client";

import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  ShieldCheck,
  ShieldX,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { ApiKey } from "@/lib/types";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyExpiry, setNewKeyExpiry] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<{ plaintext: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      setKeys(data.apiKeys || []);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadKeys(); }, [loadKeys]);

  async function handleRevoke(keyId: string) {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.apiKeys = (current.apiKeys || []).map((k: ApiKey) =>
        k.id === keyId ? { ...k, revoked: !k.revoked } : k
      );
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) {
        setKeys(current.apiKeys);
        toast.success("Key updated");
      } else toast.error("Failed to save");
    } catch {
      toast.error("Connection error");
    }
  }

  async function handleDelete(keyId: string) {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.apiKeys = (current.apiKeys || []).filter((k: ApiKey) => k.id !== keyId);
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) {
        setKeys(current.apiKeys);
        toast.success("Key deleted");
        setConfirmDelete(null);
      } else toast.error("Failed to save");
    } catch {
      toast.error("Connection error");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      const keyRes = await fetch("/api/admin/api-keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim(),
          expiresAt: newKeyExpiry || null,
        }),
      });
      if (!keyRes.ok) { toast.error("Failed to generate key"); return; }
      const { key, plaintext } = await keyRes.json();
      current.apiKeys = [...(current.apiKeys || []), key];
      const saveRes = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (saveRes.ok) {
        setKeys(current.apiKeys);
        setRevealedKey({ plaintext, name: key.name });
        setNewKeyName("");
        setNewKeyExpiry("");
        setShowCreate(false);
      } else toast.error("Failed to save key");
    } catch {
      toast.error("Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  function getStatus(key: ApiKey): { label: string; color: string } {
    if (key.revoked) return { label: "Revoked", color: "text-error bg-error-soft" };
    if (key.expiresAt && new Date(key.expiresAt) <= new Date()) return { label: "Expired", color: "text-warning bg-warning-soft" };
    return { label: "Active", color: "text-emerald-400 bg-emerald-400/10" };
  }

  const activeCount = keys.filter((k) => !k.revoked && (!k.expiresAt || new Date(k.expiresAt) > new Date())).length;
  const expiredCount = keys.filter((k) => !k.revoked && k.expiresAt && new Date(k.expiresAt) <= new Date()).length;
  const revokedCount = keys.filter((k) => k.revoked).length;

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="w-[200px] h-[16px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="flex gap-md mb-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-md flex-1">
              <div className="w-[60px] h-[24px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
              <div className="w-[30px] h-[28px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
        <div className="card p-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-sm mb-md">
              <div className="flex-1 h-[40px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="w-[80px] h-[40px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[960px]">
      <Toaster position="top-center" toastOptions={{ style: { background: "#111", color: "#ededed", border: "1px solid #222" } }} />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h1 className="text-display text-ink m-0 flex items-center gap-sm">
            <Key size={28} className="text-accent" />
            API Keys
          </h1>
          <p className="text-body text-mute mt-xxs">Manage API keys for accessing public endpoints</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-xs">
          <Plus size={16} />
          Create Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-md mb-lg">
        <div className="card p-md flex items-center gap-sm">
          <ShieldCheck size={20} className="text-emerald-400" />
          <div>
            <div className="text-display text-ink">{activeCount}</div>
            <div className="text-caption text-mute">Active</div>
          </div>
        </div>
        <div className="card p-md flex items-center gap-sm">
          <Clock size={20} className="text-warning" />
          <div>
            <div className="text-display text-ink">{expiredCount}</div>
            <div className="text-caption text-mute">Expired</div>
          </div>
        </div>
        <div className="card p-md flex items-center gap-sm">
          <ShieldX size={20} className="text-error" />
          <div>
            <div className="text-display text-ink">{revokedCount}</div>
            <div className="text-caption text-mute">Revoked</div>
          </div>
        </div>
      </div>

      {/* Key List */}
      {keys.length === 0 ? (
        <div className="card p-lg">
          <div className="flex flex-col items-center justify-center py-xl text-mute">
            <Key size={40} className="mb-sm opacity-40" />
            <p className="text-body-strong text-ink mb-xxs">No API keys yet</p>
            <p className="text-caption mb-md">Create your first API key to enable endpoint access</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-xs">
              <Plus size={16} />
              Create Key
            </button>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[1fr_100px_100px_120px_120px_100px] gap-sm px-lg py-sm text-caption text-mute border-b border-hairline bg-surface-raised/30">
            <span>Name</span>
            <span>Key Prefix</span>
            <span>Status</span>
            <span>Created</span>
            <span>Expires</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Table Rows */}
          {keys.map((key) => {
            const status = getStatus(key);
            return (
              <div key={key.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_100px_120px_120px_100px] gap-xxs md:gap-sm px-lg py-sm border-b border-hairline last:border-b-0 items-center hover:bg-surface-raised/30 transition-colors">
                <div>
                  <div className="text-body-strong text-ink">{key.name}</div>
                  <div className="md:hidden text-caption text-mute">ID: {key.id.slice(0, 8)}...</div>
                </div>
                <div>
                  <code className="text-caption-mono text-mute bg-surface-raised px-xs py-xxs rounded-xs">{key.keyPrefix}...</code>
                </div>
                <div>
                  <span className={`badge ${status.color}`}>{status.label}</span>
                </div>
                <div className="text-caption text-mute">
                  {new Date(key.createdAt).toLocaleDateString()}
                </div>
                <div className="text-caption text-mute">
                  {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : "\u2014"}
                </div>
                <div className="flex items-center justify-end gap-xs">
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className={`btn-ghost p-xs ${key.revoked ? "text-emerald-400" : "text-warning"}`}
                    title={key.revoked ? "Unrevoke" : "Revoke"}
                  >
                    {key.revoked ? <ShieldCheck size={16} /> : <ShieldX size={16} />}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(key.id)}
                    className="btn-ghost p-xs text-error"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Delete confirmation inline */}
                {confirmDelete === key.id && (
                  <div className="md:col-span-6 flex items-center gap-sm p-sm bg-error-soft/30 rounded-md border border-error/20">
                    <AlertTriangle size={16} className="text-error flex-shrink-0" />
                    <span className="text-caption text-body flex-1">Delete &ldquo;{key.name}&rdquo; permanently?</span>
                    <button onClick={() => handleDelete(key.id)} className="btn-primary bg-error hover:bg-red-700 text-caption py-xxs">
                      Delete
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="btn-ghost text-caption py-xxs">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md" onClick={() => setShowCreate(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative card-accent p-lg w-full max-w-[440px] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-heading text-ink m-0 mb-md">Create API Key</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-md">
                <label className="label">Key Name</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Mobile App"
                  required
                  autoFocus
                />
                <p className="text-caption text-mute mt-xxs">A descriptive name to identify this key</p>
              </div>
              <div className="mb-lg">
                <label className="label">Expiry Date (optional)</label>
                <input
                  type="date"
                  className="input w-full"
                  value={newKeyExpiry}
                  onChange={(e) => setNewKeyExpiry(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-caption text-mute mt-xxs">Leave empty for no expiration</p>
              </div>
              <div className="flex items-center justify-end gap-sm">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-xs" disabled={creating || !newKeyName.trim()}>
                  <Key size={16} />
                  {creating ? "Creating..." : "Generate Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Key Reveal Dialog */}
      {revealedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md" onClick={() => setRevealedKey(null)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative card-accent p-lg w-full max-w-[520px] animate-scale-in border border-warning/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-sm mb-sm">
              <AlertTriangle size={20} className="text-warning" />
              <h2 className="text-heading text-ink m-0">Key Created</h2>
            </div>
            <p className="text-body text-mute mb-sm">
              Copy this key now. <strong className="text-warning">You won&rsquo;t be able to see it again.</strong>
            </p>
            <div className="p-md rounded-md bg-[#050505] border border-hairline mb-md">
              <div className="flex items-center justify-between mb-xs">
                <span className="text-caption text-mute">{revealedKey.name}</span>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(revealedKey.plaintext);
                    setCopied(true);
                    toast.success("Key copied to clipboard");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="btn-ghost flex items-center gap-xs text-caption"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <code className="text-caption-mono text-ink break-all select-all">{revealedKey.plaintext}</code>
            </div>
            <button
              onClick={() => setRevealedKey(null)}
              className="btn-primary w-full"
            >
              I&rsquo;ve saved the key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
