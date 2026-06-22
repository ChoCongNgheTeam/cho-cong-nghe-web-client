"use client";

import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastyProvider } from "./components/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartAuthSync } from "@/components/CartAuthSync";
import { WishlistProvider } from "./contexts/WishlistContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Analytics } from "@vercel/analytics/next";
import { useFcmToken } from "@/hooks/useFcmToken";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import SettingsPrefetcher from "@/components/SettingsPrefetcher";
import DynamicFavicon from "@/components/DynamicFavicon";
import DynamicSeoMeta from "@/components/DynamicSeoMeta";
import MaintenanceGuard from "@/components/MaintenanceGuard";

function FcmInitializer() {
  useFcmToken();
  return null;
}

function LocaleInitializer() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    try {
      const locale = localStorage.getItem("app.locale");
      const timeZone = localStorage.getItem("app.timeZone");
      if (locale) {
        html.dataset.locale = locale;
        html.lang = locale;
      }
      if (timeZone) {
        html.dataset.timezone = timeZone;
      }
    } catch {
      // ignore storage errors
    }
  }, []);
  return null;
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <SettingsPrefetcher />
      <DynamicFavicon />
      <DynamicSeoMeta />

      <ToastyProvider>
        <AuthProvider>
          <NotificationProvider>
            <WishlistProvider>
              <ThemeProvider>
                <CartAuthSync />
                <FcmInitializer />
                <LocaleInitializer />
                {/* Guard bảo trì — đặt sau AuthProvider để đọc được user.role */}
                <MaintenanceGuard>{children}</MaintenanceGuard>
                <Analytics />
              </ThemeProvider>
            </WishlistProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastyProvider>
    </ReactQueryProvider>
  );
}
