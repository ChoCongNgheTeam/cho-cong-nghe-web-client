"use client";

import { AuthProvider } from "./contexts/AuthContext";
import { ToastyProvider } from "./components/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { useFcmToken } from "@/hooks/useFcmToken";
import { NotificationProvider } from "@/contexts/NotificationContext";

function FcmInitializer() {
  useFcmToken();
  return null;
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastyProvider>
      <AuthProvider>
        <NotificationProvider>
          <WishlistProvider>
            <ThemeProvider>
              <CartProvider>
                <FcmInitializer />
                {children}
              </CartProvider>
            </ThemeProvider>
          </WishlistProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastyProvider>
  );
}
