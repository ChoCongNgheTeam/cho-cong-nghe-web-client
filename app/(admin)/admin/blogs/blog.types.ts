export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type BlogType = "TIN_MOI" | "DANH_GIA" | "KHUYEN_MAI" | "DIEN_MAY" | "NOI_BAT";

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
  type: BlogType;
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
  type?: BlogType;
  authorId?: string;
  sortBy?: "createdAt" | "publishedAt" | "viewCount" | "title" | "updatedAt";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
}

export interface CreateBlogPayload {
  title: string;
  content: string;
  status?: BlogStatus;
  type?: BlogType;
  publishedAt?: string;
  imageUrl?: string;
  imagePath?: string;
}

export type UpdateBlogPayload = Partial<CreateBlogPayload>;
