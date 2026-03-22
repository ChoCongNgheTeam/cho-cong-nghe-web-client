export type PromotionActionType = "DISCOUNT_PERCENT" | "DISCOUNT_FIXED" | "BUY_X_GET_Y" | "GIFT_PRODUCT";

export type TargetType = "ALL" | "PRODUCT" | "CATEGORY" | "BRAND";

export interface PromotionRule {
  id: string;
  actionType: PromotionActionType;
  discountValue?: number;
  buyQuantity?: number;
  getQuantity?: number;
  giftProductVariantId?: string;
}

export interface PromotionTarget {
  id: string;
  targetType: TargetType;
  targetId?: string;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  minOrderValue?: number;
  maxDiscountValue?: number;
  usageLimit?: number;
  usedCount: number;
  isExpired: boolean;
  isAvailable: boolean;
  createdAt: string;
  rules: PromotionRule[];
  targets: PromotionTarget[];
}

export interface PromotionsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: { [key: string]: number };
}

export interface PromotionsResponse {
  data: Promotion[];
  meta: PromotionsMeta;
  message: string;
}

// Trong promotion.types.ts (FE):
export interface GetPromotionsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isExpired?: boolean;
  status?: "active" | "inactive" | "expired" | "upcoming"; // ← thêm
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "name" | "priority" | "startDate" | "endDate";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
}

export interface CreatePromotionPayload {
  name: string;
  description?: string;
  priority?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  minOrderValue?: number;
  maxDiscountValue?: number;
  usageLimit?: number;
  rules: Array<{
    actionType: PromotionActionType;
    discountValue?: number;
    buyQuantity?: number;
    getQuantity?: number;
    giftProductVariantId?: string;
  }>;
  targets: Array<{
    targetType: TargetType;
    targetId?: string;
  }>;
}

export type UpdatePromotionPayload = Partial<CreatePromotionPayload>;
