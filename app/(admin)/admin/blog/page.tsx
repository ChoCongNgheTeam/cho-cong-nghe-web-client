import { Plus, Search } from "lucide-react";
import BlogTable from "./components/blog-table";
import { AdminBlog, BlogPagination, getAdminBlogs } from "./_lib/blog.api";

type AdminBlogPageProps = {
  searchParams?: Promise<{
    page?: string;
    category?: string;
  }>;
};

const EMPTY_PAGINATION: BlogPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const parsedPage = Number(resolvedSearchParams.page ?? "1");
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const category = resolvedSearchParams.category;

  let blogs: AdminBlog[] = [];
  let pagination: BlogPagination = EMPTY_PAGINATION;
  let hasError = false;

  try {
    const res = await getAdminBlogs({ page, limit: 10, category });
    blogs = res.data ?? [];
    pagination = res.pagination ?? EMPTY_PAGINATION;
  } catch {
    hasError = true;
  }

  return (
    <section className="min-h-screen bg-neutral-light p-6 text-primary">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold">Quan ly bai viet</h1>
          <p className="text-xl font-semibold">Blogs</p>
          {hasError && (
            <p className="text-sm text-promotion">
              Khong the tai du lieu tu API. Vui long kiem tra backend.
            </p>
          )}
        </header>

        <div className="flex flex-col gap-3 rounded-xl border border-neutral bg-neutral-light p-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <select className="h-10 rounded-lg border border-neutral bg-neutral-light px-3 text-sm text-primary outline-none focus:border-accent">
              <option>Danh muc bai viet</option>
            </select>
            <button
              type="button"
              className="h-10 rounded-lg border border-neutral bg-accent-light px-3 text-sm font-medium text-primary hover:bg-accent-light-hover"
            >
              Tat ca bai viet ({pagination.total})
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral px-3 text-sm font-medium text-primary hover:bg-neutral-light-active"
            >
              <Plus size={16} />
              Tao bai viet
            </button>
          </div>
          <div className="relative w-full lg:w-80">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary-light"
            />
            <input
              type="text"
              placeholder="Search name"
              className="h-10 w-full rounded-lg border border-neutral bg-neutral-light pl-10 pr-3 text-sm text-primary outline-none placeholder:text-primary-light focus:border-accent"
            />
          </div>
        </div>

        <BlogTable blogs={blogs} pagination={pagination} currentCategory={category} />
      </div>
    </section>
  );
}
