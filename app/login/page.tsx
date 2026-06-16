"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { setError("Invalid password"); return; }
      router.push("/admin");
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="card w-full max-w-[360px] p-xl animate-fade-in">
        <div className="text-center mb-lg">
          <div className="w-[56px] h-[56px] rounded-lg bg-accent flex items-center justify-center mx-auto mb-md">
            <span className="text-white text-2xl font-bold">D</span>
          </div>
          <h1 className="text-heading text-ink m-0">DjavaLauncher</h1>
          <p className="text-body text-body mt-xxs">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <LockKeyhole size={16} className="absolute left-sm top-1/2 -translate-y-1/2 text-mute pointer-events-none" />
              <input
                type="password"
                className="input w-full pl-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
          </div>
          {error && <p className="text-caption text-error m-0">{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
