export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogAuthor {
  id: string;
  fullName?: string;
  email: string;
  avatarImage?: string;
  blogCount?: number;
}

export interface BlogCard {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt: string;
  viewCount: number;
  status: BlogStatus;
  author: BlogAuthor;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface BlogDetail extends BlogCard {
  content: string;
}

export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BlogsResponse {
  data: BlogCard[];
  pagination: BlogPagination;
  message: string;
}

export interface GetBlogsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogStatus;
  authorId?: string;
  sortBy?: "createdAt" | "publishedAt" | "viewCount" | "title" | "updatedAt";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
}

export interface CreateBlogPayload {
  title: string;
  content: string;
  status?: BlogStatus;
  publishedAt?: string;
  imageUrl?: string;
  imagePath?: string;
}

export type UpdateBlogPayload = Partial<CreateBlogPayload>;
