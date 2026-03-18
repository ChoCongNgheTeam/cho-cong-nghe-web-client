export const BLOG_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã đăng",
  ARCHIVED: "Lưu trữ",
};

export const BLOG_STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-neutral-dark bg-neutral-light-active",
  PUBLISHED: "text-emerald-600 bg-emerald-50",
  ARCHIVED: "text-neutral-dark bg-neutral-light-active",
};

export const BLOG_STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PUBLISHED", label: "Đã đăng" },
  { value: "DRAFT", label: "Nháp" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

export const SORT_OPTIONS = [
  { value: "publishedAt", label: "Ngày đăng" },
  { value: "createdAt", label: "Ngày tạo" },
  { value: "updatedAt", label: "Cập nhật" },
  { value: "viewCount", label: "Lượt xem" },
  { value: "title", label: "Tiêu đề" },
];
