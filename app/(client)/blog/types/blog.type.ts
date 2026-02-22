export type Author = {
  id: string;
  fullName: string;
  email: string;
  avatarImage?: string | null;
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
  commentsCount: number; // 👈 THÊM
  author: Author;
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
