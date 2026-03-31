export type DiscountType = "DISCOUNT_PERCENT" | "DISCOUNT_FIXED";
export type TargetType = "ALL" | "PRODUCT" | "CATEGORY" | "BRAND";

export interface VoucherTarget {
  id: string;
  targetType: TargetType;
  targetId?: string;
}

export interface VoucherCard {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountValue?: number;
  maxUses?: number;
  usesCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isExpired: boolean;
  isAvailable: boolean;
  createdAt: string;
}

export interface VoucherDetail extends VoucherCard {
  maxUsesPerUser?: number;
  priority: number;
  updatedAt: string;
  targets: VoucherTarget[];
}

export interface VoucherPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VoucherMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: { ALL: number; active: number; inactive: number; expired: number; upcoming: number };
  ALL: number;
  active: number;
  inactive: number;
  expired: number;
  upcoming: number;
}

export interface VouchersResponse {
  data: VoucherCard[];
  pagination: VoucherPagination;
  message: string;
  meta: VoucherMeta;
}

export interface GetVouchersParams {
  page?: number;
  limit?: number;
  search?: string;
  discountType?: DiscountType;
  isActive?: boolean;
  isExpired?: boolean;
  sortBy?: "createdAt" | "code" | "discountValue" | "usesCount" | "priority";
  sortOrder?: "asc" | "desc";
  status?: "active" | "inactive" | "expired" | "upcoming";
}

export interface CreateVoucherPayload {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountValue?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  startDate?: string;
  endDate?: string;
  priority?: number;
  isActive?: boolean;
  targets?: Array<{ targetType: TargetType; targetId?: string }>;
}

export type UpdateVoucherPayload = Omit<Partial<CreateVoucherPayload>, "code"> & { code?: string };
