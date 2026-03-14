export const FILTER_TYPE_LABELS: Record<string, string> = {
  RANGE: "Khoảng giá trị",
  ENUM: "Danh sách chọn",
  BOOLEAN: "Có / Không",
};

export const FILTER_TYPE_COLORS: Record<string, string> = {
  RANGE: "text-blue-600 bg-blue-50",
  ENUM: "text-purple-600 bg-purple-50",
  BOOLEAN: "text-amber-600 bg-amber-50",
};

export const SORT_OPTIONS = [
  { value: "sortOrder", label: "Thứ tự hiển thị" },
  { value: "name", label: "Tên" },
  { value: "group", label: "Nhóm" },
  { value: "createdAt", label: "Ngày tạo" },
];

export const STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
];

export const FILTERABLE_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "filterable", label: "Có thể lọc" },
  { value: "not_filterable", label: "Không lọc" },
];

export const DEFAULT_GROUP = "Thông số khác";
