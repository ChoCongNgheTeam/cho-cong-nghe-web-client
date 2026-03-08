import apiRequest from "@/lib/api";
import { Blog, BlogListResponse } from "../types/blog.type";

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

type BlogApiItem = {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string | null;
  excerpt?: string | null;
  viewCount?: number | null;
  createdAt: string;
  publishedAt?: string | null;
  commentsCount?: number | null;
  author?: BlogApiAuthor;
  category?: BlogApiCategory | string | null;
};

type BlogApiListResponse = {
  success: boolean;
  data: BlogApiItem[];
  pagination: BlogListResponse["pagination"];
};

type GetBlogsParams = {
  page?: number;
  limit?: number;
  category?: string;
};

function mapBlog(item: BlogApiItem): Blog {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    thumbnail: item.thumbnail ?? "/images/blog-default.jpg",
    excerpt: item.excerpt ?? "",
    viewCount: item.viewCount ?? 0,
    createdAt: item.createdAt,
    publishedAt: item.publishedAt ?? item.createdAt,
    commentsCount: item.commentsCount ?? 0,
    author: {
      id: item.author?.id ?? "",
      fullName: item.author?.fullName ?? "Tac gia",
      email: item.author?.email ?? "",
      avatarImage: item.author?.avatarImage ?? null,
    },
  };
}

export async function getBlogs({
  page = 1,
  limit = 10,
  category,
}: GetBlogsParams): Promise<BlogListResponse> {
  const params: Record<string, string | number> = {
    page,
    limit,
  };

  if (category) params.category = category;

  const response = await apiRequest.get<BlogApiListResponse>("/blogs", {
    params,
    noAuth: true,
    timeout: 15000,
  });

  return {
    success: response.success,
    data: response.data.map(mapBlog),
    pagination: response.pagination,
  };
}
