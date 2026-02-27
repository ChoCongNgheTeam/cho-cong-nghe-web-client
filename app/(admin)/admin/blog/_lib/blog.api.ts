const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
  "http://localhost:5000";

export type AdminBlogAuthor = {
  id?: string;
  fullName?: string;
  email?: string;
};

export type AdminBlog = {
  id: string;
  title: string;
  slug: string;
  viewCount?: number;
  createdAt: string;
  author?: AdminBlogAuthor;
  category?: { name?: string } | string;
};

export type BlogPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminBlogListResponse = {
  success: boolean;
  data: AdminBlog[];
  pagination: BlogPagination;
};

type GetAdminBlogsParams = {
  page?: number;
  limit?: number;
  category?: string;
};

export async function getAdminBlogs({
  page = 1,
  limit = 10,
  category,
}: GetAdminBlogsParams): Promise<AdminBlogListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (category) {
    query.append("category", category);
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/blogs?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch blogs: ${res.status}`);
  }

  return res.json();
}
