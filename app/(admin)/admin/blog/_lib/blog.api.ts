import apiRequest from "@/lib/api";

export type AdminBlogAuthor = {
  id?: string;
  fullName?: string;
  email?: string;
};

export type AdminBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  viewCount?: number;
  commentsCount?: number;
  ratingAvg?: number;
  createdAt: string;
  publishedAt?: string;
  author?: AdminBlogAuthor;
  category?: { id?: string; name?: string; slug?: string } | string;
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

export type AdminBlogStats = {
  totalBlogs: number;
  totalViews: number;
  totalAuthors: number;
  totalCategories: number;
  publishedThisMonth: number;
};

export type AdminBlogDetail = AdminBlog & {
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  scheduledAt?: string;
};

export type AdminBlogUpsertPayload = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  scheduledAt?: string;
};

type GetAdminBlogsParams = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
};

export async function getAdminBlogs({
  page = 1,
  limit = 10,
  category,
  search,
}: GetAdminBlogsParams): Promise<AdminBlogListResponse> {
  const params: Record<string, string | number> = {
    page,
    limit,
  };

  if (category) params.category = category;
  if (search) params.search = search;

  return apiRequest.get<AdminBlogListResponse>("/blogs", {
    params,
    noAuth: true,
    timeout: 15000,
  });
}

export async function getAdminBlogStats(): Promise<AdminBlogStats> {
  const firstPage = await getAdminBlogs({
    page: 1,
    limit: 100,
  });

  let allBlogs: AdminBlog[] = [...firstPage.data];
  const totalPages = firstPage.pagination.totalPages;

  if (totalPages > 1) {
    const requests: Promise<AdminBlogListResponse>[] = [];
    for (let page = 2; page <= totalPages; page += 1) {
      requests.push(getAdminBlogs({ page, limit: 100 }));
    }

    const pages = await Promise.all(requests);
    for (const page of pages) {
      allBlogs = allBlogs.concat(page.data);
    }
  }

  const authors = new Set<string>();
  const categories = new Set<string>();
  let totalViews = 0;
  let publishedThisMonth = 0;
  const now = new Date();

  for (const blog of allBlogs) {
    totalViews += blog.viewCount ?? 0;

    const authorKey = blog.author?.id ?? blog.author?.email ?? blog.author?.fullName;
    if (authorKey) authors.add(authorKey);

    if (typeof blog.category === "string") {
      if (blog.category) categories.add(blog.category);
    } else if (blog.category?.name) {
      categories.add(blog.category.name);
    }

    const createdAt = new Date(blog.createdAt);
    const isValidDate = !Number.isNaN(createdAt.getTime());
    if (
      isValidDate &&
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    ) {
      publishedThisMonth += 1;
    }
  }

  return {
    totalBlogs: firstPage.pagination.total,
    totalViews,
    totalAuthors: authors.size,
    totalCategories: categories.size,
    publishedThisMonth,
  };
}

type AdminBlogSingleResponse = {
  success: boolean;
  data: AdminBlogDetail;
};

export async function getAdminBlogById(id: string): Promise<AdminBlogDetail> {
  const response = await apiRequest.get<AdminBlogSingleResponse>(`/blogs/${id}`, {
    noAuth: true,
    timeout: 15000,
  });
  return response.data;
}

export async function createAdminBlog(
  payload: AdminBlogUpsertPayload
): Promise<AdminBlogDetail> {
  const response = await apiRequest.post<AdminBlogSingleResponse>("/blogs", payload, {
    noAuth: true,
    timeout: 15000,
  });
  return response.data;
}

export async function updateAdminBlog(
  id: string,
  payload: AdminBlogUpsertPayload
): Promise<AdminBlogDetail> {
  const response = await apiRequest.patch<AdminBlogSingleResponse>(`/blogs/${id}`, payload, {
    noAuth: true,
    timeout: 15000,
  });
  return response.data;
}
