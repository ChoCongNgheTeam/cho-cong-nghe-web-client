import { Plus, Search } from "lucide-react";
import Link from "next/link";
import BlogListClient from "./components/blog-list-client";
import {
  ADMIN_BLOG_CATEGORIES,
  getAdminBlogCategoryTitle,
  isAdminBlogInCategory,
  resolveAdminBlogCategory,
} from "./_lib/blog-category";
import {
  AdminBlog,
  AdminBlogStats,
  BlogPagination,
  getAdminBlogs,
  getAdminBlogStats,
} from "./_lib/blog.api";

type AdminBlogPageProps = {
  searchParams?: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
};

const PAGE_SIZE = 10;
const FETCH_LIMIT = 50;

const EMPTY_STATS: AdminBlogStats = {
  totalBlogs: 0,
  totalViews: 0,
  totalAuthors: 0,
  totalCategories: 0,
  publishedThisMonth: 0,
};

function buildFallbackStats(blogs: AdminBlog[]): AdminBlogStats {
  const authors = new Set<string>();
  const categories = new Set<string>();
  let totalViews = 0;
  let publishedThisMonth = 0;
  const now = new Date();

  for (const blog of blogs) {
    totalViews += Number(blog.viewCount ?? 0);

    const authorKey = blog.author?.id ?? blog.author?.email ?? blog.author?.fullName;
    if (authorKey) authors.add(authorKey);

    categories.add(resolveAdminBlogCategory(blog).key);

    const createdAt = new Date(blog.createdAt);
    if (
      !Number.isNaN(createdAt.getTime()) &&
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    ) {
      publishedThisMonth += 1;
    }
  }

  return {
    totalBlogs: blogs.length,
    totalViews,
    totalAuthors: authors.size,
    totalCategories: categories.size,
    publishedThisMonth,
  };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

async function getAllAdminBlogs(search?: string): Promise<AdminBlog[]> {
  const firstPage = await getAdminBlogs({
    page: 1,
    limit: FETCH_LIMIT,
    search,
  });

  const totalPages = Math.max(1, firstPage.pagination?.totalPages ?? 1);
  if (totalPages <= 1) return firstPage.data ?? [];

  const requests: ReturnType<typeof getAdminBlogs>[] = [];
  for (let page = 2; page <= totalPages; page += 1) {
    requests.push(
      getAdminBlogs({
        page,
        limit: FETCH_LIMIT,
        search,
      })
    );
  }

  const pages = await Promise.allSettled(requests);
  const merged: AdminBlog[] = [...(firstPage.data ?? [])];

  for (const page of pages) {
    if (page.status === "fulfilled" && Array.isArray(page.value.data)) {
      merged.push(...page.value.data);
    }
  }

  return merged;
}

function buildFilterHref({
  page = 1,
  category,
  search,
}: {
  page?: number;
  category?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  return `/admin/blogs?${params.toString()}`;
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const parsedPage = Number(resolvedSearchParams.page ?? "1");
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const category = resolvedSearchParams.category;
  const search = resolvedSearchParams.search?.trim();

  let allBlogs: AdminBlog[] = [];
  let stats: AdminBlogStats = EMPTY_STATS;
  let hasError = false;
  let hasStatsError = false;

  const [blogListResult, blogStatsResult] = await Promise.allSettled([
    getAllAdminBlogs(search),
    getAdminBlogStats(),
  ]);

  if (blogListResult.status === "fulfilled") {
    allBlogs = blogListResult.value;
  } else {
    hasError = true;
  }

  if (blogStatsResult.status === "fulfilled") {
    stats = blogStatsResult.value;
  } else {
    hasStatsError = true;
    stats = buildFallbackStats(allBlogs);
  }

  const filteredBlogs = allBlogs.filter((blog) => isAdminBlogInCategory(blog, category));
  const total = filteredBlogs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageBlogs = filteredBlogs.slice(startIndex, startIndex + PAGE_SIZE);

  const pagination: BlogPagination = {
    page: currentPage,
    limit: PAGE_SIZE,
    total,
    totalPages,
  };

  const categoryCounts = ADMIN_BLOG_CATEGORIES.map((item) => ({
    ...item,
    count: allBlogs.filter((blog) => resolveAdminBlogCategory(blog).key === item.key).length,
  }));

  const currentCategoryLabel = getAdminBlogCategoryTitle(category);

  return (
    <section className="min-h-screen bg-neutral-light p-6 text-primary">
      <div className="mx-auto flex w-full max-w-350 flex-col gap-6">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold">Quản lý bài viết</h1>
          <p className="text-xl font-semibold">Blogs</p>
          {hasError && (
            <p className="text-sm text-promotion">
              Không thể tải dữ liệu từ API. Vui lòng kiểm tra backend.
            </p>
          )}
          {hasStatsError && (
            <p className="text-sm text-promotion">
              Không thể tải thống kê blogs. Đang hiển thị thống kê tạm theo dữ liệu bảng.
            </p>
          )}
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-xl border border-neutral bg-neutral-light p-4">
            <p className="text-sm text-primary-light">Tổng blogs</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatNumber(stats.totalBlogs)}
            </p>
          </article>
          <article className="rounded-xl border border-neutral bg-neutral-light p-4">
            <p className="text-sm text-primary-light">Tổng lượt xem</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatNumber(stats.totalViews)}
            </p>
          </article>
          <article className="rounded-xl border border-neutral bg-neutral-light p-4">
            <p className="text-sm text-primary-light">Tổng tác giả</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatNumber(stats.totalAuthors)}
            </p>
          </article>
          <article className="rounded-xl border border-neutral bg-neutral-light p-4">
            <p className="text-sm text-primary-light">Tổng danh mục</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatNumber(stats.totalCategories)}
            </p>
          </article>
          <article className="rounded-xl border border-neutral bg-neutral-light p-4">
            <p className="text-sm text-primary-light">Bài viết tháng này</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatNumber(stats.publishedThisMonth)}
            </p>
          </article>
        </section>

        <div className="rounded-xl border border-neutral bg-neutral-light p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">Filter Blogs</h2>
            <Link
              href="/admin/blogs"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Reset filter
            </Link>
          </div>

          <form className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <select
                name="category"
                defaultValue={category ?? ""}
                className="h-10 rounded-lg border border-neutral bg-neutral-light px-3 text-sm text-primary outline-none focus:border-accent"
              >
                <option value="">Tất cả danh mục</option>
                {ADMIN_BLOG_CATEGORIES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="h-10 rounded-lg border border-neutral bg-accent-light px-3 text-sm font-medium text-primary hover:bg-accent-light-hover"
              >
                {currentCategoryLabel} ({pagination.total})
              </button>
              <Link
                href="/admin/blogs/create"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral px-3 text-sm font-medium text-primary hover:bg-neutral-light-active"
              >
                <Plus size={16} />
                Tạo bài viết
              </Link>
            </div>
            <div className="relative w-full lg:w-80">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary-light"
              />
              <input
                type="text"
                name="search"
                defaultValue={search ?? ""}
                placeholder="Search title or slug"
                className="h-10 w-full rounded-lg border border-neutral bg-neutral-light pl-10 pr-3 text-sm text-primary outline-none placeholder:text-primary-light focus:border-accent"
              />
            </div>
            <input type="hidden" name="page" value="1" />
            <button
              type="submit"
              className="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-neutral-light hover:bg-accent-hover"
            >
              Lọc
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={buildFilterHref({ page: 1, search })}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                !category
                  ? "border-accent bg-accent-light text-primary"
                  : "border-neutral text-primary-light hover:text-primary"
              }`}
            >
              Tất cả ({allBlogs.length})
            </Link>
            {categoryCounts.map((item) => (
              <Link
                key={item.key}
                href={buildFilterHref({ page: 1, category: item.key, search })}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  category === item.key
                    ? "border-accent bg-accent-light text-primary"
                    : "border-neutral text-primary-light hover:text-primary"
                }`}
              >
                {item.title} ({item.count})
              </Link>
            ))}
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">
              {category ? `Danh mục: ${currentCategoryLabel}` : "Tất cả blogs"}
            </h2>
            <p className="text-sm text-primary-light">
              Hiển thị {pageBlogs.length} / {pagination.total} bài viết
            </p>
          </div>

          <BlogListClient
            blogs={pageBlogs}
            pagination={pagination}
            currentCategory={category}
            currentSearch={search}
          />
        </section>
      </div>
    </section>
  );
}
