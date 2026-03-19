export const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  FLASH_SALE: "Flash Sale",
  SEASONAL: "Theo mùa",
  BRAND: "Thương hiệu",
  CATEGORY: "Danh mục",
  SPECIAL: "Đặc biệt",
};

export const CAMPAIGN_TYPE_COLORS: Record<string, string> = {
  FLASH_SALE: "text-red-600 bg-red-50",
  SEASONAL: "text-emerald-600 bg-emerald-50",
  BRAND: "text-blue-600 bg-blue-50",
  CATEGORY: "text-purple-600 bg-purple-50",
  SPECIAL: "text-amber-600 bg-amber-50",
};

export const STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "expired", label: "Đã kết thúc" },
];

export const TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại" },
  { value: "FLASH_SALE", label: "Flash Sale" },
  { value: "SEASONAL", label: "Theo mùa" },
  { value: "BRAND", label: "Thương hiệu" },
  { value: "CATEGORY", label: "Danh mục" },
  { value: "SPECIAL", label: "Đặc biệt" },
];

type SortField = "createdAt" | "name" | "startDate" | "endDate";

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "name", label: "Tên" },
  { value: "startDate", label: "Ngày bắt đầu" },
  { value: "endDate", label: "Ngày kết thúc" },
];
