import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import ClientProviders from "./ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChoCongNghe - Điện thoại, Laptop, Phụ kiện & Điện lạnh chính hãng",
  description: "Chuyên cung cấp điện thoại, laptop, phụ kiện công nghệ và thiết bị điện lạnh chính hãng. Giá cả cạnh tranh, bảo hành uy tín, giao hàng nhanh chóng toàn quốc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* ── Favicon tĩnh từ favicon.io — fallback khi chưa load DB ── */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* ── Google Analytics ── */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-L1GEXYJQKK" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L1GEXYJQKK');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/*
          DynamicFavicon nằm trong ClientProviders (qua SettingsPrefetcher).
          Khi settings load xong và có favicon_url → override thẻ <link> trên.
          Khi chưa có → favicon tĩnh ở trên được dùng bình thường.
        */}
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
