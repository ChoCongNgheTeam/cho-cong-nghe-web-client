const ANON_ID_COOKIE = "anon_id";
const ANON_ID_MAX_AGE_DAYS = 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeDays: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeDays * 24 * 60 * 60}; SameSite=Lax`;
}

/**
 * Lấy (hoặc tạo mới) 1 ID ẩn danh ổn định cho khách CHƯA đăng nhập — dùng làm
 * `sessionId` cho module recommendation (gợi ý "Có thể bạn thích" theo hành vi
 * xem gần đây, không cần tài khoản). Lưu bằng cookie thật (không phải
 * localStorage) để sau này nếu cần đọc ở Server Component (SSR) vẫn dùng được,
 * và nhất quán với cách `refreshToken` đang được lưu trong app.
 *
 * LƯU Ý: chỉ nên gọi hàm này ở những nơi đã kiểm tra
 * `hasPersonalizationConsent()` trước (xem lib/cookie-consent) — bản thân hàm
 * này không tự check consent, để tách biệt 2 mối quan tâm (tạo id vs được
 * phép dùng id để cá nhân hoá hay không).
 */
export function getOrCreateAnonId(): string {
  const existing = readCookie(ANON_ID_COOKIE);
  if (existing) return existing;

  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  writeCookie(ANON_ID_COOKIE, id, ANON_ID_MAX_AGE_DAYS);
  return id;
}
