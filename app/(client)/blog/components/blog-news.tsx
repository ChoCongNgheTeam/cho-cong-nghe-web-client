import Link from "next/link";
import { BLOG_NEWS } from "../_lib/mock-blog";
import type { BlogCategory } from "../_lib/blog.type";

type BlogNewsProps = {
  category: BlogCategory;
};

export default function BlogNews({ category }: BlogNewsProps) {
  // ===== FILTER THEO CATEGORY =====
  const filteredBlogs =
    category === "featured"
      ? BLOG_NEWS
      : BLOG_NEWS.filter((blog) => blog.category === category);

  // tránh crash khi category không có bài
  if (filteredBlogs.length === 0) {
    return null;
  }

  const [main, ...subs] = filteredBlogs;

  return (
    <section className="mt-20 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Tin mới</h2>
        <Link
          href="/blog"
          className="text-sm font-medium text-accent hover:underline"
        >
          Khám phá →
        </Link>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT – BÀI LỚN */}
        <Link
          href={`/blog/${main.slug}`}
          className="lg:col-span-7 group block space-y-3"
        >
          <div className="rounded-2xl overflow-hidden">
            <img
              src={main.thumbnail}
              alt={main.title}
              className="w-full h-[320px] object-cover group-hover:scale-105 transition"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold line-clamp-2">
              {main.title}
            </h3>

            <p className="text-sm text-secondary line-clamp-2">
              {main.excerpt}
            </p>

            <div className="text-xs text-secondary flex items-center gap-2">
              <span>⏱ {main.publishedAt}</span>
              <span>•</span>
              <span>{main.author}</span>
            </div>
          </div>
        </Link>

        {/* RIGHT – GRID NHỎ */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {subs.map((item) => (
            <Link
              key={item.id}
              href={`/blog/${item.slug}`}
              className="group space-y-2"
            >
              <div className="rounded-xl overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-[120px] object-cover group-hover:scale-105 transition"
                />
              </div>

              <h4 className="text-sm font-medium line-clamp-2">
                {item.title}
              </h4>

              <div className="text-xs text-secondary">
                ⏱ {item.publishedAt} · {item.author}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
