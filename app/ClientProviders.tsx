"use client";

import { AuthProvider } from "./contexts/AuthContext";
import { ToastyProvider } from "./components/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { useFcmToken } from "@/hooks/useFcmToken";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { useEffect } from "react";

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
      <ToastyProvider>
        <AuthProvider>
          <NotificationProvider>
            <WishlistProvider>
              <ThemeProvider>
                <CartProvider>
                  <FcmInitializer />
                  <LocaleInitializer />
                  {children}
                </CartProvider>
              </ThemeProvider>
            </WishlistProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastyProvider>
    </ReactQueryProvider>
  );
}
