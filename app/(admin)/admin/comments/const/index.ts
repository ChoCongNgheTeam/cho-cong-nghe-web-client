export const TARGET_TYPE_LABELS: Record<string, string> = {
  BLOG: "Blog",
  PRODUCT: "Sản phẩm",
  PAGE: "Trang",
};

export const TARGET_TYPE_COLORS: Record<string, string> = {
  BLOG: "text-blue-600 bg-blue-50",
  PRODUCT: "text-emerald-600 bg-emerald-50",
  PAGE: "text-purple-600 bg-purple-50",
};

export const APPROVAL_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "true", label: "Đã duyệt" },
  { value: "false", label: "Chờ duyệt" },
];

export const SORT_OPTIONS = [{ value: "createdAt", label: "Ngày tạo" }];
