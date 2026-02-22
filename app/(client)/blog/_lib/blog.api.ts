import { apiFetch } from "./api-client";
import { BlogListResponse } from "../types/blog.type";

type GetBlogsParams = {
  page?: number;
  limit?: number;
  category?: string;
};

export async function getBlogs({
  page = 1,
  limit = 10,
  category,
}: GetBlogsParams): Promise<BlogListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (category) {
    query.append("category", category);
  }

  return apiFetch<BlogListResponse>(`/blogs?${query.toString()}`);
}
