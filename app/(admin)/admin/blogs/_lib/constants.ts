import type { BlogType } from "../blog.types";

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

// ── Blog Type ──────────────────────────────────────────────────────────────────

export const BLOG_TYPE_LABELS: Record<BlogType, string> = {
  TIN_MOI: "Tin mới",
  DANH_GIA: "Đánh giá - Tư vấn",
  KHUYEN_MAI: "Khuyến mãi",
  DIEN_MAY: "Điện máy - Gia dụng",
  NOI_BAT: "Nổi bật",
};

export const BLOG_TYPE_COLORS: Record<BlogType, string> = {
  TIN_MOI: "text-blue-600 bg-blue-50",
  DANH_GIA: "text-violet-600 bg-violet-50",
  KHUYEN_MAI: "text-orange-600 bg-orange-50",
  DIEN_MAY: "text-teal-600 bg-teal-50",
  NOI_BAT: "text-amber-600 bg-amber-50",
};

/** Dùng cho filter tabs trên trang list */
export const BLOG_TYPE_TABS = [
  { value: "ALL", label: "Tất cả loại" },
  { value: "NOI_BAT", label: "Nổi bật" },
  { value: "TIN_MOI", label: "Tin mới" },
  { value: "DANH_GIA", label: "Đánh giá" },
  { value: "DIEN_MAY", label: "Điện máy" },
  { value: "KHUYEN_MAI", label: "Khuyến mãi" },
];

export const SORT_OPTIONS = [
  { value: "publishedAt", label: "Ngày đăng" },
  { value: "createdAt", label: "Ngày tạo" },
  { value: "updatedAt", label: "Cập nhật" },
  { value: "viewCount", label: "Lượt xem" },
  { value: "title", label: "Tiêu đề" },
];
