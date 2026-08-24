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
  // same-origin-allow-popups (không phải "same-origin" mặc định nghiêm ngặt hơn):
  // cho phép cửa sổ popup (Google Sign-In ux_mode: "popup" ở hooks/useGoogleLogin.ts)
  // giao tiếp lại qua window.postMessage() sau khi user đăng nhập xong, đồng thời
  // vẫn giữ cô lập COOP cho các tương tác cross-origin khác (chống tabnabbing).
  // Thiếu header này, trình duyệt áp COOP mặc định nghiêm ngặt hơn và chặn hẳn
  // postMessage từ popup — đã xác nhận qua log lỗi thật trên production
  // ("Cross-Origin-Opener-Policy policy would block the window.postMessage call").
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  // 🔴 Lớp phòng thủ thứ 2 chống crash production ERR_REQUIRE_ESM (xem
  // pnpm-workspace.yaml — đã pin jsdom về 24.1.0 để loại bỏ dependency ESM gây
  // lỗi). serverExternalPackages báo cho Next.js KHÔNG cố bundle/transform các
  // package này, mà để Node.js tự require() thật ở runtime — đây là cách chính
  // thức Next.js khuyến nghị cho package có dependency native/ESM phức tạp như
  // jsdom. Không thể verify 100% trong môi trường dev local (bug gốc CŨNG không
  // xuất hiện ở local/preview, chỉ crash trên Vercel production thật — đây là
  // đặc điểm đã biết của lớp lỗi này), nên thêm cấu hình này làm lớp bảo vệ bổ
  // sung độc lập với việc pin version, đề phòng trường hợp Next.js compiler vẫn
  // cố bundle jsdom vì lý do khác.
  serverExternalPackages: ["jsdom", "isomorphic-dompurify"],
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
