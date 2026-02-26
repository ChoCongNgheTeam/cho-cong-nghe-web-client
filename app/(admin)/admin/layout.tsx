"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      console.log(user);
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="shrink-0 h-full">
        <AdminSidebar />
      </div>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
