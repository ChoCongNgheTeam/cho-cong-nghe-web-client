import Link from "next/link";
import { getBlogs } from "./_lib/blog.api";
import BlogCategoryBar from "./components/BlogCategoryBar";
import BlogPagination from "./components/BlogPagination";
import { Blog } from "./types/blog.type";

type Props = {
  searchParams?: {
    page?: string;
    category?: string;
  };
};

export default async function BlogPage(props: Props) {
  /**
   * =========================
   * SAFE SEARCH PARAMS
   * (né bug Turbopack)
   * =========================
   */
  const searchParams = props.searchParams ?? {};

  const page =
    typeof searchParams.page === "string"
      ? Number(searchParams.page)
      : 1;

  const category =
    typeof searchParams.category === "string"
      ? searchParams.category
      : undefined;

  /**
   * =========================
   * FETCH BLOGS
   * =========================
   */
  const res = await getBlogs({
    page,
    limit: 6,
    category,
  });

  const blogs = res.data;
  const pagination = res.pagination;

  const fillBlogs = (items: Blog[], count: number) => {
    if (items.length === 0) return [];
    return Array.from({ length: count }, (_, i) => items[i % items.length]);
  };

  const featuredBlogs = fillBlogs(blogs, 5);
  const newProductBlogs = fillBlogs(blogs, 4);
  const latestBlogs = fillBlogs(blogs, 5);
  const reviewBlogs = fillBlogs(blogs, 5);
  const promoBlogs = fillBlogs(blogs, 5);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-sm text-gray-500 mb-4">
        Trang chủ / Tin tức / Điện thoại / Bài viết
      </div>

      <section className="mb-6">
        <BlogCategoryBar active={category} />
      </section>

      {/* NỔI BẬT */}
      <section className="mb-8">
        <SectionTitle>NỔI BẬT</SectionTitle>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {featuredBlogs[0] && (
              <Link href={`/blog/${featuredBlogs[0].slug}`} className="block">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={featuredBlogs[0].thumbnail || "/images/blog-default.jpg"}
                    alt={featuredBlogs[0].title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-tight line-clamp-2">
                  {featuredBlogs[0].title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {featuredBlogs[0].excerpt}
                </p>
              </Link>
            )}
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {featuredBlogs.slice(1, 5).map((blog) => (
              <BlogCardSmall key={`featured-${blog.id}-${blog.slug}`} blog={blog} />
            ))}
          </div>
        </div>
      </section>

      {/* SẢN PHẨM MỚI */}
      <section className="mb-8">
        <SectionTitle>SẢN PHẨM MỚI</SectionTitle>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {newProductBlogs.map((blog) => (
            <Link
              key={`product-${blog.id}-${blog.slug}`}
              href={`/blog/${blog.slug}`}
              className="flex items-center gap-3 rounded-lg border bg-white p-3 hover:shadow-sm"
            >
              <div className="h-12 w-12 overflow-hidden rounded bg-gray-100">
                <img
                  src={blog.thumbnail || "/images/blog-default.jpg"}
                  alt={blog.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Mới</p>
                <p className="text-sm font-medium line-clamp-2">{blog.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TIN MỚI */}
      <section className="mb-8">
        <SectionTitle>Tin mới</SectionTitle>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {latestBlogs[0] && (
              <Link href={`/blog/${latestBlogs[0].slug}`} className="block">
                <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={latestBlogs[0].thumbnail || "/images/blog-default.jpg"}
                    alt={latestBlogs[0].title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-tight line-clamp-2">
                  {latestBlogs[0].title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {latestBlogs[0].excerpt}
                </p>
              </Link>
            )}
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {latestBlogs.slice(1, 5).map((blog) => (
              <BlogCardSmall key={`latest-${blog.id}-${blog.slug}`} blog={blog} />
            ))}
          </div>
        </div>
      </section>

      {/* ĐÁNH GIÁ - TƯ VẤN */}
      <section className="mb-8">
        <SectionTitle>Đánh giá - Tư vấn</SectionTitle>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {reviewBlogs[0] && (
              <Link href={`/blog/${reviewBlogs[0].slug}`} className="block">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={reviewBlogs[0].thumbnail || "/images/blog-default.jpg"}
                    alt={reviewBlogs[0].title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-tight line-clamp-2">
                  {reviewBlogs[0].title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {reviewBlogs[0].excerpt}
                </p>
              </Link>
            )}
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {reviewBlogs.slice(1, 5).map((blog) => (
              <BlogCardSmall key={`review-${blog.id}-${blog.slug}`} blog={blog} />
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="aspect-[4/5] w-full rounded border bg-gray-100"
            />
          ))}
        </div>
      </section>

      {/* KHUYẾN MÃI */}
      <section className="mb-10">
        <SectionTitle>Khuyến mãi</SectionTitle>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {promoBlogs[0] && (
              <Link href={`/blog/${promoBlogs[0].slug}`} className="block">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={promoBlogs[0].thumbnail || "/images/blog-default.jpg"}
                    alt={promoBlogs[0].title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-tight line-clamp-2">
                  {promoBlogs[0].title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {promoBlogs[0].excerpt}
                </p>
              </Link>
            )}
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {promoBlogs.slice(1, 5).map((blog) => (
              <BlogCardSmall key={`promo-${blog.id}-${blog.slug}`} blog={blog} />
            ))}
          </div>
        </div>
      </section>

      <section className="flex justify-center">
        <BlogPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
        />
      </section>
    </main>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-4 text-base font-semibold uppercase tracking-wide text-gray-800">
      {children}
    </h2>
  );
}

function BlogCardSmall({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="block">
      <div className="overflow-hidden rounded-lg border bg-white hover:shadow-sm">
        <div className="aspect-[4/3] w-full bg-gray-100">
          <img
            src={blog.thumbnail || "/images/blog-default.jpg"}
            alt={blog.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-2">
          <p className="text-sm font-medium leading-snug line-clamp-2">
            {blog.title}
          </p>
        </div>
      </div>
    </Link>
  );
}
