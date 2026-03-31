/**
 * timezone.helpers.ts
 *
 * Dùng sau khi server chạy TZ=UTC.
 * API trả về UTC ISO thật: "2026-03-28T10:01:00.000Z"
 *
 * FE luôn hiển thị giờ VN (GMT+7) cho user.
 */

const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // 7 giờ tính bằng ms

/**
 * UTC ISO → "YYYY-MM-DDTHH:mm" giờ VN  (dùng cho <input type="datetime-local">)
 *
 * "2026-03-28T10:01:00.000Z"  →  "2026-03-28T17:01"
 * "2026-03-27T17:00:00.000Z"  →  "2026-03-28T00:00"
 */
export function utcToVNLocal(utcIso?: string | null): string {
  if (!utcIso) return "";
  const utcMs = new Date(utcIso).getTime();
  if (isNaN(utcMs)) return "";
  const d = new Date(utcMs + VN_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` + `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/**
 * "YYYY-MM-DDTHH:mm" giờ VN → UTC ISO string  (dùng khi submit form)
 *
 * "2026-03-28T17:01"  →  "2026-03-28T10:01:00.000Z"
 * "2026-03-28T00:00"  →  "2026-03-27T17:00:00.000Z"
 */
export function vnLocalToUtc(localStr: string): string | undefined {
  if (!localStr || localStr.length < 16) return undefined;
  const [datePart, timePart] = localStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) - VN_OFFSET_MS;
  return new Date(utcMs).toISOString();
}

/**
 * UTC ISO → Date object giờ VN  (dùng để so sánh status trong badge/table)
 *
 * Parse UTC ISO bình thường — JS tự xử lý đúng vì string có Z chuẩn.
 * So sánh với new Date() (cũng UTC) là đúng.
 *
 * "2026-03-28T10:01:00.000Z" → Date(UTC 10:01)
 * new Date() tại VN 18:00    → Date(UTC 11:00)
 * → 10:01 < 11:00 → đã bắt đầu → active ✓
 */
export function parseAPIDate(utcIso?: string | null): Date | null {
  if (!utcIso) return null;
  const d = new Date(utcIso); // parse UTC chuẩn, không cần strip Z
  return isNaN(d.getTime()) ? null : d;
}
