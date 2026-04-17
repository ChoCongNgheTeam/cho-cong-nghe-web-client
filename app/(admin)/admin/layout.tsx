"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "sonner"; // ← Thêm dòng này

import AdminSidebar from "@/components/admin/sidebar";
import AdminHeaderAuto from "@/components/admin/AdminHeaderAuto";
import { AdminPreferencesProvider } from "@/contexts/AdminPreferencesContext";
import { AdminNotificationProvider } from "@/contexts/AdminNotificationContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/account");
      } else if (user.role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== "ADMIN") return null;

  return (
    <AdminNotificationProvider>
      <AdminPreferencesProvider>
        <div className="flex h-screen bg-neutral-light text-primary">
          <div className="shrink-0 h-full">
            <AdminSidebar />
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <AdminHeaderAuto />
            <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
          </div>
        </div>

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
          theme="light" // hoặc "dark" nếu bạn dùng dark mode
        />
        {/* ============================================================ */}
      </AdminPreferencesProvider>
    </AdminNotificationProvider>
  );
}
