import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "./contexts/AuthContext";
import { ToastyProvider } from "./components/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";

import Header from "@/components/layout/Header/header";
import Footer from "@/components/layout/Footer/footer";
import ToggleSwitch from "@/components/ui/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trang chủ ChoCongNghe",
  description: "Đang phát triển",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ToastyProvider>
          <AuthProvider>
            <ThemeProvider>
              <CartProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <ToggleSwitch />

                  <main className="flex-1">{children}</main>

                  <Footer />
                </div>
              </CartProvider>
            </ThemeProvider>
          </AuthProvider>
        </ToastyProvider>
      </body>
    </html>
  );
}
