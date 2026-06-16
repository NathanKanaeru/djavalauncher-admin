"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  RefreshCw,
  Megaphone,
  Server,
  Database,
  BookOpen,
  ChevronRight,
  LogOut,
  Key,
} from "lucide-react";

const BREADCRUMB_MAP: Record<string, { label: string; icon: typeof LayoutDashboard }> = {
  "/admin": { label: "Dashboard", icon: LayoutDashboard },
  "/admin/updates": { label: "Updates", icon: RefreshCw },
  "/admin/announcements": { label: "Announcements", icon: Megaphone },
  "/admin/servers": { label: "Servers", icon: Server },
  "/admin/game-data": { label: "Game Data", icon: Database },
  "/admin/api-docs": { label: "API Docs", icon: BookOpen },
  "/admin/api-keys": { label: "API Keys", icon: Key },
};

export default function Header() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string; icon: typeof LayoutDashboard }[] = [];
  let href = "";
  for (const seg of segments) {
    href += `/${seg}`;
    const entry = BREADCRUMB_MAP[href];
    if (entry) breadcrumbs.push({ ...entry, href });
  }

  const currentIcon = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].icon : null;
  const Icon = currentIcon || LayoutDashboard;

  return (
    <header className="header-desktop bg-header border-b border-hairline h-[64px] flex items-center justify-between px-lg flex-shrink-0">
      {/* ── Left: Page Icon + Breadcrumbs ── */}
      <div className="flex items-center gap-md min-w-0">
        {Icon && (
          <div className="w-[32px] h-[32px] rounded-md bg-accent-soft flex items-center justify-center flex-shrink-0">
            <Icon size={16} className="text-accent" />
          </div>
        )}
        <nav className="flex items-center gap-[2px] text-caption-mono min-w-0">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-[2px] min-w-0">
              {i > 0 && <ChevronRight size={12} className="text-mute flex-shrink-0" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="text-body font-medium truncate">{crumb.label}</span>
              ) : (
                <a
                  href={crumb.href}
                  className="text-mute hover:text-body transition-colors truncate flex-shrink-0"
                >
                  {crumb.label}
                </a>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* ── Right: Logout ── */}
      <button
        onClick={async () => {
          document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/login";
        }}
        className="btn-ghost flex items-center gap-xs text-mute hover:text-error"
        title="Log out"
      >
        <LogOut size={16} />
        <span className="text-caption hidden sm:inline">Log out</span>
      </button>
    </header>
  );
}
