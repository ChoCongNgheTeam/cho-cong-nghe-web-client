import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Domain ảnh: ĐÃ ĐỔI SANG "https:" wildcard thay vì liệt kê từng domain.
// Lý do: footer/trang policy dùng logo đối tác + banner "đã thông báo Bộ Công
// Thương" từ nhiều domain khác nhau do admin/CMS tự thêm (clickbuy.com.vn,
// webmedia.com.vn...) — không thể liệt kê hết trước, và danh sách sẽ liên tục
// vỡ mỗi khi có logo/banner mới. img-src rộng vẫn AN TOÀN HƠN NHIỀU so với
// script-src rộng: <img> không tự thực thi JS, rủi ro còn lại chỉ là exfiltrate
// dữ liệu qua request ảnh (mức độ thấp hơn XSS rất nhiều) — đây là đánh đổi hợp
// lý. Nếu muốn siết lại chặt hơn, xem ghi chú "SIẾT LẠI" bên dưới.
const IMG_SRC = `img-src 'self' data: blob: https:`;

// Domain gọi API (connect-src) không đoán được hết ngay từ đầu — Google
// Analytics gửi beacon tới www.google-analytics.com/www.google.com (không nằm
// trong *.googleapis.com), và trang địa chỉ dùng public API
// provinces.open-api.vn. Mỗi khi thêm tích hợp mới gọi domain ngoài, CSP sẽ
// ÂM THẦM chặn (không throw lỗi JS rõ ràng) — nhớ thêm domain vào đây.
const CONNECT_SRC_EXTRA = [
  "https://www.google-analytics.com",
  "https://www.google.com",
  "https://provinces.open-api.vn",
  // vercel.live widget cần gọi API/websocket riêng ngoài việc chỉ hiện iframe
  // (xem ghi chú frame-src bên dưới) — thêm luôn ở đây để tránh phải quay lại vá
  // lần 2 khi phát hiện thêm 1 CSP violation khác từ cùng 1 widget.
  "https://vercel.live",
].join(" ");

function getApiOrigin(): string {
  try {
    return process.env.NEXT_PUBLIC_API_BASE_URL ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin : "";
  } catch {
    return "";
  }
}

function buildCsp(nonce: string): string {
  const apiOrigin = getApiOrigin();
  const isDev = process.env.NODE_ENV !== "production";
  // 'unsafe-eval' CHỈ bật ở development — React DevTools/Fast Refresh dùng eval()
  // để dựng lại call stack khi debug, đây là hành vi bình thường của React dev
  // mode (không phải lỗ hổng). React KHÔNG BAO GIỜ dùng eval() ở production build,
  // nên production CSP vẫn giữ nguyên strict, không có unsafe-eval.
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  // 'strict-dynamic' cho phép các script mà Next.js tự inject (chunk loader) chạy được
  // miễn là được load bởi 1 script đã có nonce hợp lệ — đây là cách CSP nonce-based
  // chính thức mà Next.js khuyến nghị (https://nextjs.org/docs/app/guides/content-security-policy).
  // KHÔNG dùng 'unsafe-inline' cho script-src: nếu dùng, CSP gần như vô nghĩa với XSS.
  return [
    `default-src 'self'`,
    scriptSrc,
    // accounts.google.com: Google Identity Services (nút đăng nhập Google) tự
    // load stylesheet riêng (https://accounts.google.com/gsi/style) — thiếu domain
    // này khiến nút Google Sign-In hiển thị không đúng style dù vẫn hoạt động.
    `style-src 'self' 'unsafe-inline' https://accounts.google.com`,
    IMG_SRC,
    `font-src 'self' data:`,
    `connect-src 'self' ${apiOrigin} https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com ${CONNECT_SRC_EXTRA}`.trim(),
    // vercel.live: Vercel tự động chèn widget Live Feedback/Toolbar vào mọi
    // deployment (production lẫn preview) qua iframe — đây là hạ tầng của chính
    // Vercel, không phải code của app, nhưng vẫn cần whitelist nếu không muốn nó
    // bị CSP âm thầm chặn (không ảnh hưởng chức năng chính của site, chỉ là công
    // cụ debug/feedback của Vercel, nhưng chặn nó sẽ tạo noise CSP error liên tục
    // trong Console, dễ nhầm là bug thật).
    `frame-src 'self' https://accounts.google.com https://www.facebook.com https://vercel.live`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export function middleware(request: NextRequest) {
  // Nonce ngẫu nhiên MỖI request — không cache, không tái sử dụng giữa các request,
  // nếu không CSP nonce mất tác dụng (kẻ tấn công đoán/tái dùng được nonce cũ).
  // Middleware chạy trên Edge runtime -> KHÔNG dùng Buffer (API của Node), chỉ dùng
  // Web Crypto (crypto.getRandomValues) + btoa, đều có sẵn ở Edge/trình duyệt.
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));
  const csp = buildCsp(nonce);

  const hasSession = request.cookies.has("refreshToken");
  if (request.nextUrl.pathname === "/account" && hasSession) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));
    redirectResponse.headers.set("Content-Security-Policy", csp);
    return redirectResponse;
  }

  // Truyền nonce xuống Server Components qua request header (đọc bằng headers() trong
  // layout/component để gắn vào các <script nonce={nonce}> tự viết tay — Next.js tự
  // động gắn nonce cho script nội bộ của nó khi thấy CSP header có 'nonce-...').
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Áp dụng cho mọi route trừ static assets / _next internals / favicon,
    // vì CSP + nonce cần có mặt trên toàn bộ trang render HTML.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  ],
};
