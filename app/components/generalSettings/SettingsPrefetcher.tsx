"use client";

import { useAllSettings } from "@/hooks/useGeneralSettings";

/**
 * Prefetch tất cả site settings ngay khi app mount.
 * Đặt bên trong ReactQueryProvider.
 * Các hook con (useGeneralSettings, useSeoSettings) sẽ đọc từ cache — không gọi thêm request.
 */
export default function SettingsPrefetcher() {
  useAllSettings();
  return null;
}
