export type Author = {
  id: string;
  fullName: string;
  email: string;
  avatarImage?: string | null;
};

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type BlogType = "TIN_MOI" | "DANH_GIA" | "KHUYEN_MAI" | "DIEN_MAY" | "NOI_BAT";

export const BLOG_TYPE_LABEL: Record<BlogType, string> = {
  TIN_MOI: "Tin mới",
  DANH_GIA: "Đánh giá - Tư vấn",
  KHUYEN_MAI: "Khuyến mãi",
  DIEN_MAY: "Điện máy - Gia dụng",
  NOI_BAT: "Nổi bật",
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type Blog = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  excerpt: string;
  viewCount: number;
  createdAt: string;
  publishedAt: string;
  commentsCount: number;
  status?: BlogStatus;
  type?: BlogType;
  category?: BlogCategory | null;
  author: Author;
};

export type BlogDetail = Blog & {
  content: string;
  updatedAt: string;
  status: BlogStatus;
  type: BlogType;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type BlogListResponse = {
  success: boolean;
  data: Blog[];
  pagination: Pagination;
};
