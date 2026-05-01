import { CastSettingsObject, GeneralSettings, SeoSettings } from "@/(admin)/admin/settings/_libs/settings";
import apiRequest from "@/lib/api";

/* ─── Re-export types để dùng ở client ─── */
export type { GeneralSettings, SeoSettings };

/* ─── Defaults ─── */
export const GENERAL_DEFAULTS: GeneralSettings = {
  site_name: "My Shop",
  site_email: "",
  site_phone: "",
  logo_url: "/logo-dark-5.png",
  favicon_url: "/favicon.ico",
  maintenance_mode: false,
  maintenance_message: "Hệ thống đang bảo trì, vui lòng quay lại sau.",
};

export const SEO_DEFAULTS: SeoSettings = {
  meta_title: "",
  meta_description: "",
  og_image_url: "",
  google_analytics_id: "",
  facebook_pixel_id: "",
};

/* ─── Helper merge ─── */
function parseSettings<T extends object>(data: CastSettingsObject, defaults: T): T {
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const k = key as string;
    if (k in data && data[k] !== undefined && data[k] !== null) {
      (result as Record<string, unknown>)[k] = data[k];
    }
  }
  return result;
}

/* ─── Fetchers ─── */
export async function fetchGeneralSettings(): Promise<GeneralSettings> {
  try {
    const res = await apiRequest.get<{ data: CastSettingsObject }>("/settings/general", {
      noAuth: true,
      timeout: 8000,
    });
    return parseSettings(res.data, GENERAL_DEFAULTS);
  } catch {
    return GENERAL_DEFAULTS;
  }
}

export async function fetchSeoSettings(): Promise<SeoSettings> {
  try {
    const res = await apiRequest.get<{ data: CastSettingsObject }>("/settings/seo", {
      noAuth: true,
      timeout: 8000,
    });
    return parseSettings(res.data, SEO_DEFAULTS);
  } catch {
    return SEO_DEFAULTS;
  }
}

export async function fetchAllSettings(): Promise<{
  general: GeneralSettings;
  seo: SeoSettings;
}> {
  try {
    const res = await apiRequest.get<{ data: Record<string, CastSettingsObject> }>("/settings", {
      noAuth: true,
      timeout: 8000,
    });
    return {
      general: parseSettings(res.data?.general ?? {}, GENERAL_DEFAULTS),
      seo: parseSettings(res.data?.seo ?? {}, SEO_DEFAULTS),
    };
  } catch {
    return { general: GENERAL_DEFAULTS, seo: SEO_DEFAULTS };
  }
}
