import type { ConsentCategories, ConsentState } from "./types";

const CONSENT_COOKIE = "cookie_consent";
const CONSENT_MAX_AGE_DAYS = 180;

const DEFAULT_CATEGORIES: ConsentCategories = {
  preferences: false,
  personalization: false,
  marketing: false,
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeDays: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeDays * 24 * 60 * 60}; SameSite=Lax`;
}

/** Đọc lựa chọn cookie hiện tại. `decided: false` nghĩa là khách chưa từng chọn — cần hiện banner. */
export function getConsent(): ConsentState {
  const raw = readCookie(CONSENT_COOKIE);
  if (!raw) return { ...DEFAULT_CATEGORIES, decided: false };

  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CATEGORIES, ...parsed, decided: true };
  } catch {
    return { ...DEFAULT_CATEGORIES, decided: false };
  }
}

export function saveConsent(categories: ConsentCategories) {
  writeCookie(CONSENT_COOKIE, JSON.stringify(categories), CONSENT_MAX_AGE_DAYS);
}

/** Dùng ở bất kỳ đâu (kể cả ngoài component React) để check nhanh có được phép cá nhân hoá không. */
export function hasPersonalizationConsent(): boolean {
  return getConsent().personalization;
}

export type { ConsentCategories, ConsentState } from "./types";
