"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  RefreshCw,
  Megaphone,
  Server,
  Database,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Key,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Updates", href: "/admin/updates", icon: RefreshCw },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Servers", href: "/admin/servers", icon: Server },
  { label: "Game Data", href: "/admin/game-data", icon: Database },
  { label: "API Docs", href: "/admin/api-docs", icon: BookOpen },
  { label: "API Keys", href: "/admin/api-keys", icon: Key },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className={`sidebar-desktop bg-sidebar border-r border-hairline flex flex-col transition-all duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? "w-[64px]" : "w-[240px]"
      }`}
      style={{ minHeight: "100vh", position: "sticky", top: 0 }}
    >
      {/* ── Logo Area ── */}
      <div
        className={`flex items-center h-[64px] border-b border-hairline flex-shrink-0 ${
          collapsed ? "justify-center px-0" : "px-md"
        }`}
      >
        <div
          className={`flex items-center gap-sm ${collapsed ? "" : "flex-1"}`}
        >
          <div className="w-[34px] h-[34px] rounded-lg bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-glow-sm">
            D
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-body-strong text-ink truncate">DjavaLauncher</div>
              <div className="text-caption text-mute truncate">Admin Panel</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 flex flex-col gap-[2px] px-xs py-sm">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-sm rounded-md transition-all duration-150 ease-out ${
                collapsed ? "justify-center" : "px-sm"
              } ${
                active
                  ? "bg-accent-glow text-accent font-medium"
                  : "text-body hover:text-ink hover:bg-surface-raised"
              }`}
              style={{
                height: collapsed ? 40 : 36,
                ...(active && !collapsed ? {} : {}),
              }}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] rounded-r-full bg-gradient-to-b from-gradient-start to-gradient-end"
                />
              )}
              <Icon
                size={active && !collapsed ? 20 : 18}
                className={`flex-shrink-0 transition-all duration-150 ${
                  active && !collapsed ? "text-accent" : ""
                }`}
              />
              {!collapsed && (
                <span className="text-body truncate">{item.label}</span>
              )}
            </a>
          );
        })}
      </nav>

      {/* ── Collapse Toggle ── */}
      <div className="px-xs pb-sm flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center justify-center gap-xs py-xs rounded-md transition-all duration-150 text-mute hover:text-ink hover:bg-surface-raised w-full ${
            collapsed ? "h-[36px]" : "h-[32px]"
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <>
              <PanelLeftClose size={16} />
              <span className="text-caption">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
