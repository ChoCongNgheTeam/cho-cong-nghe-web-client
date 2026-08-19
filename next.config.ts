import type { NextConfig } from "next";

// CSP cần nonce theo từng request (cho inline script) nên được set trong middleware.ts,
// không phải ở đây — headers() của next.config chỉ tạo được header TĨNH, không thể sinh
// nonce ngẫu nhiên mỗi lần request. Xem middleware.ts để biết CSP thật sự.
// Các header còn lại không cần nonce nên đặt tĩnh ở đây là đủ.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "store.storeimages.cdn-apple.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn2.fptshop.com.vn",
      },
      {
        protocol: "https",
        hostname: "cdn2.cellphones.com.vn",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "graph.facebook.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
    ],
    qualities: [75, 80],
  },

  typedRoutes: false,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
