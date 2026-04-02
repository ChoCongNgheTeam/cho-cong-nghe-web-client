import apiRequest from "@/lib/api";
import { getBlogTypeLabel } from "./blog-category";
import { Blog, BlogDetail, BlogListResponse, BlogStatus, BlogType } from "../types/blog.type";

type ApiResponseBase = {
  success?: boolean;
  message?: string;
};

type BlogApiAuthor = {
  id?: string;
  fullName?: string;
  email?: string;
  avatarImage?: string | null;
};

type BlogApiCategory = {
  id?: string;
  name?: string;
  slug?: string;
};

type BlogApiListItem = {
  id?: string;
  title?: string;
  slug?: string;
  thumbnail?: string | null;
  imageUrl?: string | null;
  excerpt?: string | null;
  content?: string | null;
  viewCount?: number | null;
  createdAt?: string;
  publishedAt?: string | null;
  commentsCount?: number | null;
  status?: BlogStatus;
  type?: BlogType | null;
  author?: BlogApiAuthor;
  category?: BlogApiCategory | string | null;
};

type BlogApiDetailItem = BlogApiListItem & {
  updatedAt?: string;
};

type BlogApiListResponse = ApiResponseBase & {
  data?: BlogApiListItem[];
  pagination?: BlogListResponse["pagination"];
};

type BlogApiDetailResponse = ApiResponseBase & {
  data?: BlogApiDetailItem;
};

type GetBlogsParams = {
  page?: number;
  limit?: number;
};

function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractExcerpt(content: string, maxLength = 180): string {
  const plain = stripHtml(content);
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}...`;
}

function resolveThumbnail(item: BlogApiListItem): string {
  return item.thumbnail ?? item.imageUrl ?? "/images/avatar.png";
}

function mapBlog(item: BlogApiListItem): Blog {
  const createdAt = item.createdAt ?? new Date().toISOString();
  const publishedAt = item.publishedAt ?? createdAt;
  const title = item.title ?? "Bài viết";
  const excerpt = item.excerpt ?? extractExcerpt(item.content ?? "");

  return {
    id: item.id ?? "",
    title,
    slug: item.slug ?? "",
    thumbnail: resolveThumbnail(item),
    excerpt,
    viewCount: item.viewCount ?? 0,
    createdAt,
    publishedAt,
    commentsCount: item.commentsCount ?? 0,
    status: item.status,
    type: (item.type as BlogType) ?? undefined,
    category: undefined, // category derived from type now
    author: {
      id: item.author?.id ?? "",
      fullName: item.author?.fullName ?? "Tác giả",
      email: item.author?.email ?? "",
      avatarImage: item.author?.avatarImage ?? null,
    },
  };
}

function mapBlogDetail(item: BlogApiDetailItem): BlogDetail {
  const base = mapBlog(item);
  const createdAt = item.createdAt ?? base.createdAt;

  return {
    ...base,
    content: item.content ?? "",
    updatedAt: item.updatedAt ?? createdAt,
    status: item.status ?? "PUBLISHED",
    type: (item.type as any) ?? "TIN_MOI",
    publishedAt: item.publishedAt ?? base.publishedAt,
  };
}

export async function getBlogs({ page = 1, limit = 10 }: GetBlogsParams): Promise<BlogListResponse> {
  const response = await apiRequest.get<BlogApiListResponse>("/blogs", {
    params: { page, limit },
    noAuth: true,
    timeout: 15000,
  });

  return {
    success: response.success ?? true,
    data: (response.data ?? []).map(mapBlog),
    pagination: response.pagination ?? {
      page,
      limit,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getBlogBySlug(slug: string): Promise<BlogDetail> {
  const response = await apiRequest.get<BlogApiDetailResponse>(`/blogs/slug/${encodeURIComponent(slug)}`, {
    noAuth: true,
    timeout: 15000,
  });

  if (!response.data) {
    throw new Error("Khong co du lieu bai viet");
  }

  return mapBlogDetail(response.data);
}
