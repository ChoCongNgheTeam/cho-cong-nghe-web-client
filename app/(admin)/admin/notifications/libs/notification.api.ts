// ─── Types ────────────────────────────────────────────────────────────────────

import apiRequest from "@/lib/api";

export type NotificationType =
   | "WELCOME_VOUCHER"
   | "VOUCHER_EXPIRING"
   | "VOUCHER_ASSIGNED"
   | "CAMPAIGN_PROMOTION"
   | "ORDER_STATUS"
   | "USER_INACTIVE";

export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export interface Notification {
   id: string;
   userId: string;
   type: NotificationType;
   title: string;
   body: string;
   data?: Record<string, any>;
   channel: NotificationChannel;
   status: NotificationStatus;
   isRead: boolean;
   readAt: string | null;
   sentAt: string | null;
   createdAt: string;
}

export interface NotificationListResponse {
   data: Notification[];
   meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      unreadCount: number;
   };
   message: string;
}

export interface SendCampaignPayload {
   title: string;
   body: string;
   data?: Record<string, string>;
   targetAll?: boolean;
   userIds?: string[];
}

export interface SendCampaignResponse {
   message: string;
   data: { sentTo: number };
}

// ─── User APIs ────────────────────────────────────────────────────────────────

export const getMyNotifications = (page = 1, limit = 20) =>
   apiRequest.get<NotificationListResponse>("/notifications", {
      params: { page, limit },
   });

export const markAsRead = (id: string) =>
   apiRequest.patch<{ message: string }>(`/notifications/${id}/read`);

export const markAllAsRead = () =>
   apiRequest.patch<{ message: string }>("/notifications/read-all");

export const saveFcmToken = (
   token: string,
   device?: "web" | "ios" | "android",
) =>
   apiRequest.post<{ message: string }>("/notifications/fcm-token", {
      token,
      device,
   });

export const deleteFcmToken = (token: string) =>
   apiRequest.delete<{ message: string }>("/notifications/fcm-token", {
      token,
   });

// ─── Admin APIs ───────────────────────────────────────────────────────────────

export const sendCampaign = (payload: SendCampaignPayload) =>
   apiRequest.post<SendCampaignResponse>(
      "/notifications/admin/campaign",
      payload,
   );
