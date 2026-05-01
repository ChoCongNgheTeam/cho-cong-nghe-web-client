import apiRequest from "@/lib/api";

/* ─── Types ─── */
export type SettingDataType = "STRING" | "BOOLEAN" | "NUMBER" | "JSON";

export interface SettingEntry {
  id: string;
  group: string;
  key: string;
  value: string;
  dataType: SettingDataType;
  updatedBy?: string | null;
  updatedAt: string;
}

export type CastSettingsObject = Record<string, unknown>;

export interface GetSettingsResponse {
  data: CastSettingsObject;
  message: string;
}

export interface UpdateSettingsPayload {
  [key: string]: string | boolean | number;
}

export interface UpdateSettingsResponse {
  data: CastSettingsObject;
  message: string;
}

/* ─── Domain types ─── */

export interface GeneralSettings {
  site_name: string;
  site_email: string;
  site_phone: string;
  logo_url: string;
  favicon_url: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

export interface SeoSettings {
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  google_analytics_id: string;
  facebook_pixel_id: string;
}

export interface EcommerceSettings {
  default_currency: string;
  enable_product_review: boolean;
  enable_star_rating: boolean;
  require_star_rating: boolean;
  show_verified_label: boolean;
  review_verified_only: boolean;
  enable_product_compare: boolean;
  enable_product_discount: boolean;
  products_per_page: number;
}

export interface CheckoutSettings {
  enable_billing_address: boolean;
  billing_same_as_shipping: boolean;
  enable_guest_checkout: boolean;
  mandatory_postcode: boolean;
  auto_create_account_guest: boolean;
  send_invoice_email: boolean;
  enable_coupon: boolean;
  enable_multi_coupon: boolean;
  enable_wallet: boolean;
  enable_order_note: boolean;
  enable_pickup_point: boolean;
  enable_min_order_amount: boolean;
  min_order_amount: number;
}

export interface CustomerSettings {
  auto_approval: boolean;
  email_verification: boolean;
}

export interface OrderSettings {
  order_code_prefix: string;
  order_code_separator: string;
  cancel_within_minutes: number;
  return_within_days: number;
}

export interface WalletSettings {
  enable_online_recharge: boolean;
  enable_offline_recharge: boolean;
  min_recharge_amount: number;
}

export interface InvoiceSettings {
  business_email: string;
  business_phone: string;
  business_address: string;
  logo_url: string;
}

export interface TaxSettings {
  enable_tax: boolean;
  tax_rate: number;
}

export interface NotificationAdminSettings {
  new_order: boolean;
  order_refund: boolean;
  order_cancel: boolean;
  product_review: boolean;
  wallet_recharge: boolean;
}

/* ─── Helper: merge BE cast-object vào defaults ─── */
export function parseSettings<T extends object>(data: CastSettingsObject, defaults: T): T {
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const k = key as string;
    if (k in data && data[k] !== undefined && data[k] !== null) {
      (result as Record<string, unknown>)[k] = data[k];
    }
  }
  return result;
}

/* ─── API ─── */

export const getSettings = async (group: string): Promise<GetSettingsResponse> => {
  return apiRequest.get<GetSettingsResponse>(`/settings/${group}`);
};

export const getAllSettings = async (): Promise<{ data: Record<string, CastSettingsObject>; message: string }> => {
  return apiRequest.get("/settings");
};

export const updateSettings = async (group: string, payload: UpdateSettingsPayload): Promise<UpdateSettingsResponse> => {
  return apiRequest.patch<UpdateSettingsResponse>(`/settings/${group}`, {
    settings: payload,
  });
};

/**
 * Upload settings có kèm ảnh.
 *
 * files: key phải khớp với SETTINGS_IMAGE_FIELDS bên BE:
 *   - logo_url    → general/logo
 *   - favicon_url → general/favicon
 *   - og_image_url → seo/og image
 *
 * Khi không có file nào → gửi JSON bình thường (không tạo FormData).
 */
export const updateSettingsFormData = async (
  group: string,
  payload: UpdateSettingsPayload,
  files?: {
    logo_url?: File | null;
    favicon_url?: File | null;
    og_image_url?: File | null;
  },
): Promise<UpdateSettingsResponse> => {
  const hasFile = files && Object.values(files).some(Boolean);

  if (!hasFile) {
    return apiRequest.patch<UpdateSettingsResponse>(`/settings/${group}`, {
      settings: payload,
    });
  }

  // FormData: text fields phẳng + file fields đúng tên key BE
  const fd = new FormData();

  // Gửi từng text field phẳng để BE controller parse rawSettings từ req.body
  for (const [key, value] of Object.entries(payload)) {
    fd.append(key, String(value));
  }

  // File fields — field name = key trong DB (khớp SETTINGS_IMAGE_FIELDS)
  if (files?.logo_url) fd.append("logo_url", files.logo_url);
  if (files?.favicon_url) fd.append("favicon_url", files.favicon_url);
  if (files?.og_image_url) fd.append("og_image_url", files.og_image_url);

  return apiRequest.patch<UpdateSettingsResponse>(`/settings/${group}`, fd);
};

export const resetSettings = async (group: string): Promise<{ message: string }> => {
  return apiRequest.post<{ message: string }>(`/settings/${group}/reset`, {});
};

/* ─── Notification preferences (per-user) ─── */
export interface NotifPreferences {
  notifEmail: boolean;
  notifPush: boolean;
  notifWeeklyReport: boolean;
  notifOrderStatus: boolean;
  notifUserInactive: boolean;
  notifReviewNew: boolean;
}

export const getMyNotifPreferences = async (): Promise<{
  data: NotifPreferences;
  message: string;
}> => {
  return apiRequest.get("/users/me/notification-preferences");
};

export const updateMyNotifPreferences = async (payload: Partial<NotifPreferences>): Promise<{ data: NotifPreferences; message: string }> => {
  return apiRequest.patch("/users/me/notification-preferences", payload);
};
