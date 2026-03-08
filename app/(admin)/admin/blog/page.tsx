import { Plus, Search } from "lucide-react";
import Link from "next/link";
import BlogTable from "./components/blog-table";
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

const EMPTY_PAGINATION: BlogPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const EMPTY_STATS: AdminBlogStats = {
  totalBlogs: 0,
  totalViews: 0,
  totalAuthors: 0,
  totalCategories: 0,
  publishedThisMonth: 0,
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const parsedPage = Number(resolvedSearchParams.page ?? "1");
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const category = resolvedSearchParams.category;
  const search = resolvedSearchParams.search?.trim();

  let blogs: AdminBlog[] = [];
  let pagination: BlogPagination = EMPTY_PAGINATION;
  let stats: AdminBlogStats = EMPTY_STATS;
  let hasError = false;
  let hasStatsError = false;

  const [blogListResult, blogStatsResult] = await Promise.allSettled([
    getAdminBlogs({ page, limit: 10, category, search }),
    getAdminBlogStats(),
  ]);

  if (blogListResult.status === "fulfilled") {
    blogs = blogListResult.value.data ?? [];
    pagination = blogListResult.value.pagination ?? EMPTY_PAGINATION;
  } else {
    hasError = true;
  }

  if (blogStatsResult.status === "fulfilled") {
    stats = blogStatsResult.value;
  } else {
    hasStatsError = true;
  }

  return (
    <section className="min-h-screen bg-neutral-light p-6 text-primary">
      <div className="mx-auto flex w-full max-w-350 flex-col gap-6">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold">Quan ly bai viet</h1>
          <p className="text-xl font-semibold">Blogs</p>
          {hasError && (
            <p className="text-sm text-promotion">
              Khong the tai du lieu tu API. Vui long kiem tra backend.
            </p>
          )}
          {hasStatsError && (
            <p className="text-sm text-promotion">
              Khong the tai thong ke blogs. Dang hien thi du lieu bang.
            </p>
          )}
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-xl border border-neutral bg-neutral-light p-4">
            <p className="text-sm text-primary-light">Tong blogs</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatNumber(stats.totalBlogs)}
            </p>
          </article>
          <article className="rounded-xl border border-neutral bg-neutral-light p-4">
            <p className="text-sm text-primary-light">Tong luot xem</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatNumber(stats.totalViews)}
            </p>
          </article>
          <article className="rounded-xl border border-neutral bg-neutral-light p-4">
            <p className="text-sm text-primary-light">Tong tac gia</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatNumber(stats.totalAuthors)}
            </p>
          </article>
          <article className="rounded-xl border border-neutral bg-neutral-light p-4">
            <p className="text-sm text-primary-light">Tong danh muc</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatNumber(stats.totalCategories)}
            </p>
          </article>
          <article className="rounded-xl border border-neutral bg-neutral-light p-4">
            <p className="text-sm text-primary-light">Bai viet thang nay</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatNumber(stats.publishedThisMonth)}
            </p>
          </article>
        </section>

        <div className="rounded-xl border border-neutral bg-neutral-light p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">Filter Blogs</h2>
            <Link
              href="/admin/blog"
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
                <option value="">Tat ca danh muc</option>
                <option value="tin-moi">Tin moi</option>
                <option value="khuyen-mai">Khuyen mai</option>
                <option value="danh-gia-tu-van">Danh gia - Tu van</option>
                <option value="kien-thuc-doi-song">Kien thuc - Doi song</option>
                <option value="thu-thuat">Thu thuat</option>
              </select>
              <button
                type="button"
                className="h-10 rounded-lg border border-neutral bg-accent-light px-3 text-sm font-medium text-primary hover:bg-accent-light-hover"
              >
                Tat ca bai viet ({pagination.total})
              </button>
              <Link
                href="/admin/blog/create"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral px-3 text-sm font-medium text-primary hover:bg-neutral-light-active"
              >
                <Plus size={16} />
                Tao bai viet
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
              Loc
            </button>
          </form>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">All blogs</h2>
            <p className="text-sm text-primary-light">
              Hien thi {blogs.length} / {pagination.total} bai viet
            </p>
          </div>

          <BlogTable
            blogs={blogs}
            pagination={pagination}
            currentCategory={category}
            currentSearch={search}
          />
        </section>
      </div>
    </section>
  );
}
