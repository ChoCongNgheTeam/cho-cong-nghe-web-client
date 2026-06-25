"use client";

import { useEffect } from "react";
import { useSeoSettings } from "@/hooks/useGeneralSettings";

/**
 * Inject SEO meta tags từ DB vào <head> client-side.
 * Chỉ override khi page không có meta riêng (tức là fallback về default).
 *
 * Đặt trong ClientProviders — chạy 1 lần sau khi settings load.
 */
export default function DynamicSeoMeta() {
  const { settings, isLoading } = useSeoSettings();

  useEffect(() => {
    if (isLoading) return;

    // ── Title ──────────────────────────────────────────────────────────────
    // Chỉ set nếu title hiện tại vẫn là default từ layout.tsx
    // (trang con có thể tự set title riêng qua generateMetadata)
    if (settings.meta_title && document.title === "ChoCongNghe - Điện thoại, Laptop, Phụ kiện & Điện lạnh chính hãng") {
      document.title = settings.meta_title;
    }

    const setMeta = (selector: string, attr: string, value: string) => {
      if (!value) return;
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrValue] = selector.replace("meta[", "").replace("]", "").split('="');
        el.setAttribute(attrName, attrValue.replace('"', ""));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    // ── Meta description ───────────────────────────────────────────────────
    setMeta('meta[name="description"]', "content", settings.meta_description);

    // ── OG tags ───────────────────────────────────────────────────────────
    setMeta('meta[property="og:title"]', "content", settings.meta_title);
    setMeta('meta[property="og:description"]', "content", settings.meta_description);
    setMeta('meta[property="og:image"]', "content", settings.og_image_url);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", settings.meta_title);
    setMeta('meta[name="twitter:description"]', "content", settings.meta_description);
    setMeta('meta[name="twitter:image"]', "content", settings.og_image_url);
  }, [settings, isLoading]);

  return null;
}
