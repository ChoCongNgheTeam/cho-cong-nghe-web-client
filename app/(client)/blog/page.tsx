import { BLOG_CATEGORIES, isBlogInCategory } from "./_lib/blog-category";
import { getBlogs } from "./_lib/blog.api";
import BlogCategoryBar from "./components/BlogCategoryBar";
import BlogList from "./components/BlogList";
import BlogPagination from "./components/BlogPagination";
import BlogSection from "./components/BlogSection";
import { Blog } from "./types/blog.type";

type Props = {
  searchParams?: Promise<{
    page?: string;
    category?: string;
  }>;
};

const PAGE_SIZE = 6;
const FETCH_LIMIT = 50;

function parseDate(value?: string): number {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

function sortByNewest(items: Blog[]): Blog[] {
  return [...items].sort((a, b) => parseDate(b.publishedAt) - parseDate(a.publishedAt));
}

function sortByFeatured(items: Blog[]): Blog[] {
  return [...items].sort((a, b) => {
    const byViews = (b.viewCount ?? 0) - (a.viewCount ?? 0);
    if (byViews !== 0) return byViews;
    return parseDate(b.publishedAt) - parseDate(a.publishedAt);
  });
}

function getCategoryTitle(categoryKey?: string): string {
  if (!categoryKey) return "Tin tức";
  return BLOG_CATEGORIES.find((item) => item.key === categoryKey)?.title ?? "Tin tức";
}

function getBlogsByCategory(items: Blog[], categoryKey: string, limit: number): Blog[] {
  const source =
    categoryKey === "featured"
      ? sortByFeatured(items)
      : sortByNewest(items.filter((blog) => blog.category?.slug === categoryKey));

  return source.slice(0, limit);
}

async function getAllBlogsForFrontend(): Promise<Blog[]> {
  const firstPage = await getBlogs({ page: 1, limit: FETCH_LIMIT });
  const totalPages = Math.max(1, firstPage.pagination.totalPages ?? 1);

  if (totalPages <= 1) {
    return firstPage.data;
  }

  const requests: ReturnType<typeof getBlogs>[] = [];
  for (let page = 2; page <= totalPages; page += 1) {
    requests.push(getBlogs({ page, limit: FETCH_LIMIT }));
  }

  const morePages = await Promise.allSettled(requests);
  const merged = [...firstPage.data];

  for (const item of morePages) {
    if (item.status === "fulfilled") {
      merged.push(...item.value.data);
    }
  }

  return merged;
}

export default async function BlogPage({ searchParams }: Props) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const parsedPage = Number(resolvedSearchParams.page ?? "1");
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const category = resolvedSearchParams.category;

  let blogs: Blog[] = [];
  try {
    blogs = await getAllBlogsForFrontend();
  } catch {
    blogs = [];
  }

  const breadcrumbLabel = getCategoryTitle(category);

  if (category) {
    const categoryBlogs = blogs.filter((blog) =>
      isBlogInCategory(category, blog.category?.slug)
    );
    const filteredBlogs =
      category === "featured"
        ? sortByFeatured(categoryBlogs)
        : sortByNewest(categoryBlogs);

    const total = filteredBlogs.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.min(requestedPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageBlogs = filteredBlogs.slice(start, start + PAGE_SIZE);

    return (
      <main className="mx-auto max-w-7xl px-4 py-8">

        <section className="mb-6">
          <BlogCategoryBar active={category} />
        </section>

        <BlogSection
          title={breadcrumbLabel}
          blogs={pageBlogs}
          heroAspectClassName="aspect-video"
          heroTitleClassName="text-xl"
        />

        <section className="flex justify-center">
          <BlogPagination currentPage={currentPage} totalPages={totalPages} />
        </section>
      </main>
    );
  }

  const featuredBlogs = getBlogsByCategory(blogs, "featured", 5);
  const newProductBlogs = getBlogsByCategory(blogs, "dien-may-gia-dung", 4);
  const latestBlogs = getBlogsByCategory(blogs, "tin-moi", 5);
  const reviewBlogs = getBlogsByCategory(blogs, "danh-gia-tu-van", 5);
  const promoBlogs = getBlogsByCategory(blogs, "khuyen-mai", 5);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-6">
        <BlogCategoryBar active={category} />
      </section>

      <BlogSection
        title="Nổi bật"
        blogs={featuredBlogs}
        heroAspectClassName="aspect-video"
        heroTitleClassName="text-xl"
      />

      <section className="mb-8">
        <h2 className="mb-4 text-base font-semibold uppercase tracking-wide text-primary">
          Điện máy - Gia dụng
        </h2>
        <BlogList blogs={newProductBlogs} />
      </section>

      <BlogSection
        title="Tin mới"
        blogs={latestBlogs}
        heroAspectClassName="aspect-[16/10]"
        heroTitleClassName="text-lg"
      />

      <BlogSection
        title="Đánh giá - Tư vấn"
        blogs={reviewBlogs}
        heroAspectClassName="aspect-video"
        heroTitleClassName="text-lg"
      />

      <BlogSection
        title="Khuyến mãi"
        blogs={promoBlogs}
        heroAspectClassName="aspect-video"
        heroTitleClassName="text-lg"
      />
    </main>
  );
}


