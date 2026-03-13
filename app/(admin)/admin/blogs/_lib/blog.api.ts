import apiRequest, { ApiError } from "@/lib/api";

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
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
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
  tags?: string[] | { name?: string; slug?: string }[];
};

export type AdminBlogUpsertPayload = {
  title: string;
  content: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string;
  imageFile?: File;
  imageUrl?: string;
  slug?: string;
  excerpt?: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  scheduledAt?: string;
};

async function withEndpointFallback<T>(
  endpoints: string[],
  request: (endpoint: string) => Promise<T>
): Promise<T> {
  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      return await request(endpoint);
    } catch (error) {
      lastError = error;
      if (!(error instanceof ApiError && error.status === 404)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Khong tim thay endpoint phu hop");
}

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

  // Admin list should include all statuses (PUBLISHED/DRAFT/ARCHIVED),
  // so use the admin-specific endpoint that returns all blogs.
  return apiRequest.get<AdminBlogListResponse>("/blogs/admin/all", {
    params,
    timeout: 15000,
  });
}

export async function getAdminBlogStats(): Promise<AdminBlogStats> {
  try {
    const statsResponse = await apiRequest.get<{ success: boolean; data: AdminBlogStats }>(
      "/blogs/stats",
      {
        timeout: 15000,
      }
    );
    if (statsResponse?.data) return statsResponse.data;
  } catch {
    // fallback to computed stats from list API
  }

  const firstPage = await getAdminBlogs({ page: 1, limit: 20 });

  let allBlogs: AdminBlog[] = Array.isArray(firstPage.data) ? [...firstPage.data] : [];
  const totalPages =
    typeof firstPage.pagination?.totalPages === "number" && firstPage.pagination.totalPages > 0
      ? firstPage.pagination.totalPages
      : 1;

  if (totalPages > 1) {
    const requests: Promise<AdminBlogListResponse>[] = [];
    for (let page = 2; page <= totalPages; page += 1) {
      requests.push(getAdminBlogs({ page, limit: 20 }));
    }

    const pages = await Promise.allSettled(requests);
    for (const page of pages) {
      if (page.status === "fulfilled" && Array.isArray(page.value.data)) {
        allBlogs = allBlogs.concat(page.value.data);
      }
    }
  }

  const authors = new Set<string>();
  const categories = new Set<string>();
  let totalViews = 0;
  let publishedThisMonth = 0;
  const now = new Date();

  for (const blog of allBlogs) {
    totalViews += Number(blog.viewCount ?? 0);

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
    totalBlogs:
      typeof firstPage.pagination?.total === "number"
        ? firstPage.pagination.total
        : allBlogs.length,
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

function toBlogFormData(payload: AdminBlogUpsertPayload): FormData {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("content", payload.content);

  if (payload.status) formData.append("status", payload.status);
  if (payload.publishedAt) formData.append("publishedAt", payload.publishedAt);

  if (payload.imageFile) {
    formData.append("imageUrl", payload.imageFile);
  } else if (payload.imageUrl) {
    try {
      new URL(payload.imageUrl);
      formData.append("imageUrl", payload.imageUrl);
    } catch {
      // Skip if not a valid URL
    }
  }

  return formData;
}

export async function getAdminBlogById(id: string): Promise<AdminBlogDetail> {
  const response = await withEndpointFallback<AdminBlogSingleResponse>(
    [`/blogs/admin/${id}`],
    (endpoint) =>
      apiRequest.get<AdminBlogSingleResponse>(endpoint, {
        timeout: 15000,
      })
  );
  return response.data;
}

export async function createAdminBlog(
  payload: AdminBlogUpsertPayload
): Promise<AdminBlogDetail> {
  const response = await apiRequest.post<AdminBlogSingleResponse>(
    "/blogs/admin",
    toBlogFormData(payload),
    {
      timeout: 15000,
    }
  );
  return response.data;
}

export async function updateAdminBlog(
  id: string,
  payload: AdminBlogUpsertPayload
): Promise<AdminBlogDetail> {
  const response = await apiRequest.patch<AdminBlogSingleResponse>(
    `/blogs/admin/${id}`,
    toBlogFormData(payload),
    {
      timeout: 15000,
    }
  );
  return response.data;
}

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export async function toggleBlogStatus(
  blogId: string,
  currentStatus?: BlogStatus
): Promise<{ success: boolean; message: string }> {
  // If currently ARCHIVED or undefined, set to PUBLISHED
  // Otherwise, set to ARCHIVED (hide)
  const newStatus: BlogStatus = currentStatus === "ARCHIVED" ? "PUBLISHED" : "ARCHIVED";

  const response = await apiRequest.patch<{ success: boolean; message: string }>(
    "/blogs/admin/bulk/status",
    { blogIds: [blogId], status: newStatus },
    {
      timeout: 15000,
    }
  );
  return response;
}
