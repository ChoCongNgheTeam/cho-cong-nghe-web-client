// ─── Types ────────────────────────────────────────────────────────────────────

import apiRequest from "@/lib/api";

export type NotificationType =
  | "WELCOME_VOUCHER"
  | "VOUCHER_EXPIRING"
  | "VOUCHER_ASSIGNED"
  | "CAMPAIGN_PROMOTION"
  | "ORDER_STATUS"
  | "USER_INACTIVE"
  | "COMMENT_NEW"
  | "REVIEW_NEW";

export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

// ─── Notification data payloads theo từng type ────────────────────────────────

export interface OrderStatusData {
  orderCode: string;
  status: string;
}

export interface VoucherData {
  voucherCode?: string;
  discountValue?: number;
  expiredAt?: string;
}

export interface CommentData {
  commentId?: string;
  productId?: string;
  productName?: string;
  productSlug?: string; // backend có thể thêm sau
  customerName?: string;
}

export interface ReviewData {
  productSlug?: string;
  reviewId?: string;
}

export interface NotificationDataMap {
  ORDER_STATUS: OrderStatusData;
  WELCOME_VOUCHER: VoucherData;
  VOUCHER_EXPIRING: VoucherData;
  VOUCHER_ASSIGNED: VoucherData;
  CAMPAIGN_PROMOTION: Record<string, string>;
  USER_INACTIVE: Record<string, string>;
  COMMENT_NEW: CommentData;
  REVIEW_NEW: ReviewData;
}

// ─── Core Notification interface ──────────────────────────────────────────────

export interface Notification<T extends NotificationType = NotificationType> {
  id: string;
  userId: string;
  type: T;
  title: string;
  body: string;
  data?: T extends keyof NotificationDataMap
    ? NotificationDataMap[T]
    : Record<string, unknown>;
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

export const saveFcmToken = (token: string, device?: "web" | "ios" | "android") =>
  apiRequest.post<{ message: string }>("/notifications/fcm-token", {
    token,
    device,
  });

export const deleteFcmToken = (token: string) =>
  apiRequest.delete<{ message: string }>("/notifications/fcm-token", { token });

// ─── Admin APIs ───────────────────────────────────────────────────────────────

export const sendCampaign = (payload: SendCampaignPayload) =>
  apiRequest.post<SendCampaignResponse>("/notifications/admin/campaign", payload);