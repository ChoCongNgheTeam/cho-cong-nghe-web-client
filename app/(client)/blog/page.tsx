import { getBlogs } from "./_lib/blog.api";
import { BLOG_CATEGORY_TABS, getBlogTypeLabel } from "./_lib/blog-category";
import BlogCategoryBar from "./components/BlogCategoryBar";
import BlogCard from "./components/BlogCard";
import BlogPagination from "./components/BlogPagination";
import { Blog, BlogType } from "./types/blog.type";
import MobileBottomNav from "@/components/layout/Header/components/MobileBottomNav";

type Props = {
  searchParams?: Promise<{ page?: string; type?: string }>;
};

const PAGE_SIZE = 9;
const FETCH_LIMIT = 100;

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDate(v?: string): number {
  if (!v) return 0;
  const ts = new Date(v).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

function sortByNewest(items: Blog[]): Blog[] {
  return [...items].sort((a, b) => parseDate(b.publishedAt) - parseDate(a.publishedAt));
}

function sortByFeatured(items: Blog[]): Blog[] {
  return [...items].sort((a, b) => {
    const byViews = (b.viewCount ?? 0) - (a.viewCount ?? 0);
    return byViews !== 0 ? byViews : parseDate(b.publishedAt) - parseDate(a.publishedAt);
  });
}

async function fetchAllBlogs(): Promise<Blog[]> {
  const first = await getBlogs({ page: 1, limit: FETCH_LIMIT });
  const totalPages = Math.max(1, first.pagination.totalPages ?? 1);
  if (totalPages <= 1) return first.data;

  const rest = await Promise.allSettled(Array.from({ length: totalPages - 1 }, (_, i) => getBlogs({ page: i + 2, limit: FETCH_LIMIT })));

  return [...first.data, ...rest.flatMap((r) => (r.status === "fulfilled" ? r.value.data : []))];
}

function getBlogsByType(blogs: Blog[], type: BlogType, limit?: number): Blog[] {
  const filtered = sortByNewest(blogs.filter((b) => b.type === type));
  return limit ? filtered.slice(0, limit) : filtered;
}

// ── Components nội bộ ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-primary">{title}</h2>
      <div className="mt-1.5 h-0.5 w-10 rounded-full bg-accent/50" />
    </div>
  );
}

/** Hero lớn + 4 card nhỏ bên cạnh */
function HeroSection({ blogs }: { blogs: Blog[] }) {
  if (!blogs.length) return null;
  const [hero, ...rest] = blogs;
  const sides = rest.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Hero */}
      <div className="lg:col-span-7">
        <BlogCard blog={hero} variant="list" />
      </div>
      {/* Side 2×2 */}
      <div className="lg:col-span-5 grid grid-cols-2 gap-3">
        {sides.map((b) => (
          <BlogCard key={b.id} blog={b} variant="list" />
        ))}
      </div>
    </div>
  );
}

/** Grid 3 hoặc 4 cột */
function GridSection({ blogs, cols = 3 }: { blogs: Blog[]; cols?: 3 | 4 }) {
  if (!blogs.length) return null;
  const colClass = cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid grid-cols-1 ${colClass} gap-4`}>
      {blogs.map((b) => (
        <BlogCard key={b.id} blog={b} variant="list" />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const rawPage = Number(sp.page ?? "1");
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const activeType = sp.type as BlogType | undefined;

  let blogs: Blog[] = [];
  try {
    blogs = await fetchAllBlogs();
  } catch {
    blogs = [];
  }

  // ── Tab lọc theo type ──────────────────────────────────────────────────────
  if (activeType) {
    const filtered = sortByNewest(blogs.filter((b) => b.type === activeType));
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const page = Math.min(currentPage, totalPages);
    const pageBlogs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const title = getBlogTypeLabel(activeType);

    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-6">
          <BlogCategoryBar active={activeType} />
        </section>

        <div className="mb-6">
          <SectionHeader title={title} />
          <GridSection blogs={pageBlogs} cols={3} />
          {!pageBlogs.length && <p className="text-sm text-primary-light py-12 text-center">Chưa có bài viết nào.</p>}
        </div>

        <div className="flex justify-center mt-8">
          <BlogPagination currentPage={page} totalPages={totalPages} />
        </div>
      </main>
    );
  }

  // ── Trang chính — chia section theo type ───────────────────────────────────
  const noibat = sortByFeatured(blogs.filter((b) => b.type === "NOI_BAT")).slice(0, 5);
  const tinmoi = getBlogsByType(blogs, "TIN_MOI", 5);
  const danhgia = getBlogsByType(blogs, "DANH_GIA", 4);
  const dienmay = getBlogsByType(blogs, "DIEN_MAY", 4);
  const khuyenmai = getBlogsByType(blogs, "KHUYEN_MAI", 4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-12">
      <section className="mb-6">
        <BlogCategoryBar active="" />
      </section>

      {/* Nổi bật — hero layout */}
      {noibat.length > 0 && (
        <section>
          <SectionHeader title="Nổi bật" />
          <HeroSection blogs={noibat} />
        </section>
      )}

      {/* Tin mới — hero layout */}
      {tinmoi.length > 0 && (
        <section>
          <SectionHeader title="Tin mới" />
          <HeroSection blogs={tinmoi} />
        </section>
      )}

      {/* Đánh giá - Tư vấn — grid 4 */}
      {danhgia.length > 0 && (
        <section>
          <SectionHeader title="Đánh giá - Tư vấn" />
          <GridSection blogs={danhgia} cols={4} />
        </section>
      )}

      {/* Điện máy - Gia dụng — grid 4 */}
      {dienmay.length > 0 && (
        <section>
          <SectionHeader title="Điện máy - Gia dụng" />
          <GridSection blogs={dienmay} cols={4} />
        </section>
      )}

      {/* Khuyến mãi — grid 4 */}
      {khuyenmai.length > 0 && (
        <section>
          <SectionHeader title="Khuyến mãi" />
          <GridSection blogs={khuyenmai} cols={4} />
        </section>
      )}

      <MobileBottomNav />
    </main>
  );
}
