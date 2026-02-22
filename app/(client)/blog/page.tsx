import { getBlogs } from "./_lib/blog.api";
import BlogCategoryBar from "./components/BlogCategoryBar";
import BlogList from "./components/BlogList";
import BlogPagination from "./components/BlogPagination";
import BlogSection from "./components/BlogSection";
import { Blog } from "./types/blog.type";

type Props = {
  searchParams?: {
    page?: string;
    category?: string;
  };
};

function fillBlogs(items: Blog[], count: number) {
  if (items.length === 0) return [];
  return Array.from({ length: count }, (_, i) => items[i % items.length]);
}

export default async function BlogPage({ searchParams }: Props) {
  const pageParam = searchParams?.page ?? "1";
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;
  const category = searchParams?.category;

  const res = await getBlogs({
    page,
    limit: 6,
    category,
  });

  const blogs = res.data;
  const pagination = res.pagination;

  const featuredBlogs = fillBlogs(blogs, 5);
  const newProductBlogs = fillBlogs(blogs, 4);
  const latestBlogs = fillBlogs(blogs, 5);
  const reviewBlogs = fillBlogs(blogs, 5);
  const promoBlogs = fillBlogs(blogs, 5);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 text-sm text-primary-light">
        Trang chủ / Tin tức / Điện thoại / Bài viết
      </div>

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
          Sản phẩm mới
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

      <section className="mb-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="aspect-[4/5] w-full rounded border border-neutral bg-neutral-light"
            />
          ))}
        </div>
      </section>

      <BlogSection
        title="Khuyến mãi"
        blogs={promoBlogs}
        heroAspectClassName="aspect-video"
        heroTitleClassName="text-lg"
      />

      <section className="flex justify-center">
        <BlogPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
        />
      </section>
    </main>
  );
}
