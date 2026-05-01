export interface StaffPermissions {
  // Đơn hàng
  canViewOrders: boolean;
  canCreateOrder: boolean;
  canUpdateOrder: boolean;
  // Sản phẩm / kho
  canViewProducts: boolean;
  canUpdateStock: boolean;
  // Marketing
  canBlogs: boolean;
  canMedia: boolean;
  canCampaigns: boolean;
  canVouchers: boolean;
  canPromotions: boolean;
  canAiContent: boolean;
  // CSKH
  canReviews: boolean;
  canComments: boolean;
  canNotifications: boolean;
  canViewUsers: boolean;
  // Báo cáo
  canAnalytics: boolean;
  canPaymentView: boolean;
}

export type PermissionKey = keyof StaffPermissions;

export const STAFF_ROLES = ["SALES", "MARKETING", "SUPPORT", "ACCOUNTING"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export type UserRole = "CUSTOMER" | "ADMIN" | StaffRole;
