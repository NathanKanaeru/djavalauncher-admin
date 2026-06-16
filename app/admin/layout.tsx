"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        setAuthenticated(true);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="flex flex-col items-center gap-md">
          <div className="w-[40px] h-[40px] rounded-lg bg-surface-raised animate-skeleton" />
          <div className="w-[120px] h-[12px] rounded-sm bg-surface-raised animate-skeleton" />
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-md md:p-lg overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
