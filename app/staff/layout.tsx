"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "sonner";

import StaffSidebar from "@/components/admin/StaffSidebar";
import AdminHeaderAuto from "@/components/admin/AdminHeaderAuto";
import { AdminNotificationProvider } from "@/contexts/AdminNotificationContext";
import { AdminPrefixProvider } from "@/contexts/AdminPrefixContext";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/account");
      } else if (user.role === "ADMIN") {
        // Admin nhỡ vào /staff thì redirect về /admin
        router.replace("/admin/dashboard");
      } else if (user.role !== "STAFF") {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "STAFF") return null;

  return (
    <AdminPrefixProvider prefix="/staff">
      <AdminNotificationProvider>
        <div className="flex h-screen bg-neutral-light text-primary">
          <div className="shrink-0 h-full">
            <StaffSidebar />
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <AdminHeaderAuto routePrefix="/staff" />
            <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
          </div>
        </div>

        <Toaster position="top-right" richColors closeButton duration={3000} theme="light" />
      </AdminNotificationProvider>
    </AdminPrefixProvider>
  );
}
