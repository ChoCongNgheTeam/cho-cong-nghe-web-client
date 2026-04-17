export type DiscountType = "DISCOUNT_PERCENT" | "DISCOUNT_FIXED";
export type TargetType = "ALL" | "PRODUCT" | "CATEGORY" | "BRAND";

export interface VoucherTarget {
  id: string;
  targetType: TargetType;
  targetId?: string;
  targetName?: string;
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

// ── Voucher Usages ────────────────────────────────────────────────────────────

export interface VoucherUsageItem {
  id: string;
  usedAt: string;
  voucher: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
  };
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  order: {
    id: string;
    orderCode: string;
    totalAmount: number;
  };
}

export interface GetVoucherUsagesParams {
  page?: number;
  limit?: number;
  voucherId?: string;
  userId?: string;
  orderId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "usedAt";
  sortOrder?: "asc" | "desc";
}

export interface VoucherUsagesResponse {
  data: VoucherUsageItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

// ── Voucher Private Users ─────────────────────────────────────────────────────

export interface VoucherUserItem {
  id: string;
  maxUses: number;
  usedCount: number;
  createdAt: string;
  voucher: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    endDate?: string;
    isActive: boolean;
  };
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface GetVoucherUsersParams {
  page?: number;
  limit?: number;
  voucherId?: string;
  userId?: string;
}

export interface VoucherUsersResponse {
  data: VoucherUserItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

// ── User search ───────────────────────────────────────────────────────────────

export interface UserResult {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  avatarImage: string | null;
  createdAt: string;
}
