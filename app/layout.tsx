import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastyProvider } from "./components/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";
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

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="vi" suppressHydrationWarning>
         <head>
            <meta name="color-scheme" content="ligessHark" />
         </head>
         <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
         >
            <ToastyProvider>
               <AuthProvider>
                  <ThemeProvider>{children}</ThemeProvider>
               </AuthProvider>
            </ToastyProvider>
         </body>
      </html>
   );
}
