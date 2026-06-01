"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Updates", href: "/admin/updates", icon: "🔄" },
  { label: "Announcements", href: "/admin/announcements", icon: "📢" },
  { label: "Servers", href: "/admin/servers", icon: "🖥️" },
  { label: "Game Data", href: "/admin/game-data", icon: "🗄️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        setAuthenticated(true);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#141218",
          color: "#cac4d0",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#141218" }}>
      <aside
        style={{
          width: 240,
          backgroundColor: "#1c1b1f",
          padding: "16px 0",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #49454f",
        }}
      >
        <div style={{ padding: "8px 20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#4f378b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                color: "#eaddff",
              }}
            >
              D
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14, color: "#e6e1e5" }}>
                DjavaLauncher
              </div>
              <div style={{ fontSize: 12, color: "#cac4d0" }}>Admin Panel</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 20px",
                  color: isActive ? "#d0bcff" : "#cac4d0",
                  backgroundColor: isActive ? "rgba(208,188,255,0.08)" : "transparent",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  borderRight: isActive ? "3px solid #d0bcff" : "3px solid transparent",
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
