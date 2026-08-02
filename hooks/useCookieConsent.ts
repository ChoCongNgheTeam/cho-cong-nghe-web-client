"use client";

import { useCallback, useEffect, useState } from "react";
import { getConsent, saveConsent } from "@/lib/cookie-consent";
import type { ConsentCategories, ConsentState } from "@/lib/cookie-consent";

export function useCookieConsent() {
  // null = chưa đọc cookie xong (tránh hydration mismatch giữa server/client) — banner chỉ hiện sau khi mount xong.
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    setConsent(getConsent());
  }, []);

  const save = useCallback((categories: ConsentCategories) => {
    saveConsent(categories);
    setConsent({ ...categories, decided: true });
  }, []);

  return {
    consent,
    showBanner: consent !== null && !consent.decided,
    save,
  };
}
