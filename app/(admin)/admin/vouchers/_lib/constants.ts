export const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  DISCOUNT_PERCENT: "Giảm %",
  DISCOUNT_FIXED: "Giảm tiền",
};

export const DISCOUNT_TYPE_COLORS: Record<string, string> = {
  DISCOUNT_PERCENT: "text-accent bg-accent/10",
  DISCOUNT_FIXED: "text-emerald-600 bg-emerald-50",
};

export const TARGET_TYPE_LABELS: Record<string, string> = {
  ALL: "Tất cả sản phẩm",
  PRODUCT: "Sản phẩm cụ thể",
  CATEGORY: "Danh mục",
  BRAND: "Thương hiệu",
};

export const STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
  { value: "expired", label: "Đã hết hạn" },
  { value: "upcoming", label: "Sắp diễn ra" },
] as const;

export const SORT_OPTIONS = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "code", label: "Mã voucher" },
  { value: "discountValue", label: "Giá trị giảm" },
  { value: "usesCount", label: "Lượt dùng" },
  { value: "priority", label: "Ưu tiên" },
];
