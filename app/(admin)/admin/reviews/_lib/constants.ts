export const REVIEW_STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

export const REVIEW_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ duyệt", color: "text-orange-500 bg-orange-50" },
  APPROVED: { label: "Đã duyệt", color: "text-emerald-600 bg-emerald-50" },
  REJECTED: { label: "Từ chối", color: "text-red-500 bg-red-50" },
};

export const RATING_OPTIONS = [1, 2, 3, 4, 5];
