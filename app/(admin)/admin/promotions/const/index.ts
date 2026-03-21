export const STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
  { value: "expired", label: "Đã hết hạn" },
  { value: "upcoming", label: "Sắp diễn ra" },
];

export const ACTION_TYPE_LABELS: Record<string, string> = {
  DISCOUNT_PERCENT: "Giảm %",
  DISCOUNT_FIXED: "Giảm tiền",
  BUY_X_GET_Y: "Mua X tặng Y",
  GIFT_PRODUCT: "Quà tặng",
};

export const ACTION_TYPE_COLORS: Record<string, string> = {
  DISCOUNT_PERCENT: "text-accent bg-accent/10",
  DISCOUNT_FIXED: "text-emerald-600 bg-emerald-50",
  BUY_X_GET_Y: "text-amber-600 bg-amber-50",
  GIFT_PRODUCT: "text-purple-600 bg-purple-50",
};

export const TARGET_TYPE_LABELS: Record<string, string> = {
  ALL: "Tất cả sản phẩm",
  PRODUCT: "Sản phẩm cụ thể",
  CATEGORY: "Danh mục",
  BRAND: "Thương hiệu",
};

export const SORT_OPTIONS = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "name", label: "Tên" },
  { value: "priority", label: "Ưu tiên" },
  { value: "startDate", label: "Ngày bắt đầu" },
  { value: "endDate", label: "Ngày kết thúc" },
];
