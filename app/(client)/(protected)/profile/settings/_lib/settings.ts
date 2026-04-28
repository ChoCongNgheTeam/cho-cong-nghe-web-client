import apiRequest from "@/lib/api";

// ─── Notification Preferences ─────────────────────────────────────────────────

/**
 * Keys khớp 1-1 với Prisma schema (users model).
 *
 * Phân quyền hiển thị theo role (FE tự filter, BE luôn trả về đủ):
 *   CUSTOMER  : notifEmail, notifPush
 *   STAFF     : notifEmail, notifPush, notifOrderStatus, notifReviewNew
 *   ADMIN     : tất cả (+ notifWeeklyReport, notifUserInactive)
 */
export interface NotifPreferences {
  notifEmail: boolean;
  notifPush: boolean;
  notifWeeklyReport: boolean;
  notifOrderStatus: boolean;
  notifUserInactive: boolean;
  notifReviewNew: boolean;
}

export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN";

/** Keys được phép chỉnh sửa theo role */
export const NOTIF_KEYS_BY_ROLE: Record<UserRole, (keyof NotifPreferences)[]> = {
  CUSTOMER: ["notifEmail", "notifPush"],
  STAFF: ["notifEmail", "notifPush", "notifOrderStatus", "notifReviewNew"],
  ADMIN: ["notifEmail", "notifPush", "notifWeeklyReport", "notifOrderStatus", "notifUserInactive", "notifReviewNew"],
};

export const NOTIF_DEFAULTS: NotifPreferences = {
  notifEmail: true,
  notifPush: true,
  notifWeeklyReport: false,
  notifOrderStatus: true,
  notifUserInactive: true,
  notifReviewNew: true,
};

export const getMyNotifPreferences = async (): Promise<{ data: NotifPreferences; message: string }> => {
  return apiRequest.get("/users/me/notification-preferences");
};

export const updateMyNotifPreferences = async (payload: Partial<NotifPreferences>): Promise<{ data: NotifPreferences; message: string }> => {
  return apiRequest.patch("/users/me/notification-preferences", payload);
};

// ─── Change Password ───────────────────────────────────────────────────────────

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changeMyPassword = async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
  return apiRequest.patch("/users/me/change-password", payload);
};
