export const STATUS_TABS: { value: "ALL" | "ACTIVE" | "INACTIVE"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Tạm dừng" },
];

export const SORT_OPTIONS = [
  { value: "name", label: "Tên" },
  { value: "createdAt", label: "Ngày tạo" },
];

export const STATUS_OPTIONS = [
  { value: "active", label: "Hoạt động", color: "text-emerald-600 bg-emerald-50" },
  { value: "hidden", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" },
];
