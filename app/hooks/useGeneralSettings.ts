"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGeneralSettings, fetchSeoSettings, fetchAllSettings, GENERAL_DEFAULTS, SEO_DEFAULTS } from "@/lib/site-settings.api";
import type { GeneralSettings, SeoSettings } from "@/lib/site-settings.api";

/* ─── Query keys ─── */
export const settingsKeys = {
  all: ["site-settings"] as const,
  general: ["site-settings", "general"] as const,
  seo: ["site-settings", "seo"] as const,
};

/* ─── Hooks ─── */

/**
 * Hook lấy general settings cho client component.
 * Cache 5 phút, không refetch on window focus (settings ít thay đổi).
 *
 * @example
 * const { logoUrl, siteName } = useGeneralSettings();
 */
export function useGeneralSettings() {
  const { data, isLoading, error } = useQuery<GeneralSettings>({
    queryKey: settingsKeys.general,
    queryFn: fetchGeneralSettings,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 30 * 60 * 1000, // giữ cache 30 phút
    refetchOnWindowFocus: false,
    placeholderData: GENERAL_DEFAULTS,
  });

  return {
    settings: data ?? GENERAL_DEFAULTS,
    // Shortcut fields hay dùng nhất
    siteName: data?.site_name ?? GENERAL_DEFAULTS.site_name,
    logoUrl: data?.logo_url ?? GENERAL_DEFAULTS.logo_url,
    faviconUrl: data?.favicon_url ?? GENERAL_DEFAULTS.favicon_url,
    maintenanceMode: data?.maintenance_mode ?? false,
    isLoading,
    error,
  };
}

export function useSeoSettings() {
  const { data, isLoading } = useQuery<SeoSettings>({
    queryKey: settingsKeys.seo,
    queryFn: fetchSeoSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: SEO_DEFAULTS,
  });

  return {
    settings: data ?? SEO_DEFAULTS,
    isLoading,
  };
}

/**
 * Prefetch tất cả settings 1 lần — dùng trong Provider hoặc layout.
 * Sau đó useGeneralSettings / useSeoSettings đọc từ cache, không gọi lại.
 */
export function useAllSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: fetchAllSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
