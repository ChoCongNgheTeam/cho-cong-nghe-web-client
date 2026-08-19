import { describe, it, expect } from "vitest";
import { formatVND } from "../formatVND";
import { formatNumber } from "../formatNumber";
import { formatDate } from "../formatDate";

// Intl.NumberFormat("vi-VN", { style: "currency" }) chèn NON-BREAKING SPACE (U+00A0)
// giữa số và ký hiệu ₫, không phải space thường — dùng regex để không phụ thuộc ký tự đó.
describe("formatVND", () => {
  it("formats a number amount as VND currency without decimals", () => {
    expect(formatVND(1000000, "vi-VN")).toMatch(/^1\.000\.000\s₫$/);
  });

  it("formats a numeric string amount", () => {
    expect(formatVND("2500000", "vi-VN")).toMatch(/^2\.500\.000\s₫$/);
  });

  it("handles zero", () => {
    expect(formatVND(0, "vi-VN")).toMatch(/^0\s₫$/);
  });

  it("falls back to NaN-safe rendering for invalid input rather than throwing", () => {
    // Ghi lại hành vi hiện tại: Number("abc") = NaN -> Intl vẫn render "NaN ₫"
    // thay vì throw. Nếu behaviour này thay đổi (vd. validate & throw), cập nhật test.
    expect(() => formatVND("abc", "vi-VN")).not.toThrow();
  });
});

describe("formatNumber", () => {
  it("formats using thousand separators for vi-VN locale", () => {
    expect(formatNumber(1234567, "vi-VN")).toBe("1.234.567");
  });

  it("formats using thousand separators for en-US locale", () => {
    expect(formatNumber(1234567, "en-US")).toBe("1,234,567");
  });
});

describe("formatDate", () => {
  it("returns an em dash for null/undefined input", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });

  it("formats a date as dd/mm/yyyy for vi-VN without time by default", () => {
    const result = formatDate("2026-01-15T00:00:00.000Z", { locale: "vi-VN", timeZone: "UTC" });
    expect(result).toBe("15/01/2026");
  });

  it("includes hour/minute when withTime is true", () => {
    const result = formatDate("2026-01-15T08:30:00.000Z", { locale: "vi-VN", timeZone: "UTC", withTime: true });
    expect(result).toMatch(/15\/01\/2026/);
    expect(result).toMatch(/08:30|8:30/);
  });
});
