"use client";

import { useEffect } from "react";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";

/**
 * Inject favicon động từ DB vào <head>.
 * Đặt trong ClientProviders — chạy sau khi settings load xong.
 *
 * Khi chưa có favicon_url trong DB → giữ nguyên favicon tĩnh trong /public.
 * Khi có favicon_url → override bằng URL từ Cloudinary.
 */
export default function DynamicFavicon() {
  const { faviconUrl, isLoading } = useGeneralSettings();

  useEffect(() => {
    if (isLoading || !faviconUrl) return;

    // Cập nhật tất cả thẻ <link rel="icon"> hiện có
    const updateLink = (rel: string, type?: string) => {
      const selector = type ? `link[rel="${rel}"][type="${type}"]` : `link[rel="${rel}"]`;
      let el = document.querySelector<HTMLLinkElement>(selector);
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        if (type) el.type = type;
        document.head.appendChild(el);
      }
      el.href = faviconUrl;
    };

    updateLink("icon", "image/png");
    updateLink("shortcut icon");

    // apple-touch-icon giữ nguyên file tĩnh, chỉ đổi icon thường
  }, [faviconUrl, isLoading]);

  return null;
}
