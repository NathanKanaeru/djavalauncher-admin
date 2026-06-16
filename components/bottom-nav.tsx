"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  RefreshCw,
  Megaphone,
  Server,
  Database,
  BookOpen,
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

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="bottom-nav bottom-nav-mobile">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <a
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${active ? "active" : ""}`}
          >
            <Icon
              size={22}
              className={`nav-icon ${active ? "text-accent" : ""}`}
            />
            <span className={`text-[10px] leading-tight ${active ? "text-accent font-medium" : ""}`}>
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
