"use client";

import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import MaintenancePage from "./MaintenancePage";

/**
 * Guard bảo trì — đặt bên trong ClientProviders (sau AuthProvider).
 *
 * Logic:
 * - maintenance_mode = false → render bình thường
 * - maintenance_mode = true + user là ADMIN → vẫn vào được (admin cần test)
 * - maintenance_mode = true + user là /admin/* → vẫn vào được
 * - maintenance_mode = true + còn lại → render MaintenancePage
 */
export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { maintenanceMode, isLoading } = useGeneralSettings();
  const { user } = useAuth();
  const pathname = usePathname();

  // Đang load settings → render bình thường tránh flash màn hình bảo trì
  if (isLoading) return <>{children}</>;

  // Không bảo trì → pass through
  if (!maintenanceMode) return <>{children}</>;

  // Admin vẫn vào được dù đang bảo trì
  const isAdmin = user?.role === "ADMIN" || pathname.startsWith("/admin");
  if (isAdmin) return <>{children}</>;

  return <MaintenancePage />;
}
