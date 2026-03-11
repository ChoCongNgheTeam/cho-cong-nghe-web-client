export type Author = {
  id: string;
  fullName: string;
  email: string;
  avatarImage?: string | null;
};

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

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
  category?: BlogCategory | null;
  author: Author;
};

export type BlogDetail = Blog & {
  content: string;
  updatedAt: string;
  status: BlogStatus;
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
