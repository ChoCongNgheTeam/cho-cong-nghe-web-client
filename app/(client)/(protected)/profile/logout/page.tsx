"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-primary">
        <Loader2 size={28} className="animate-spin text-promotion" />
        <p className="text-sm">Đang đăng xuất...</p>
      </div>
    </div>
  );
}