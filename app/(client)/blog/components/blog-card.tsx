import Link from "next/link";
import { Blog } from "../_lib/blog.type";

type Props = {
  blog: Blog;
  variant?: "featured";
  size?: "small";
};

export default function BlogCard({ blog, variant, size }: Props) {
  const imageHeight =
    variant === "featured"
      ? "h-[360px]"
      : size === "small"
      ? "h-[140px]"
      : "h-[180px]";

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block bg-neutral-light rounded-xl overflow-hidden hover:shadow-md transition"
    >
      <div className={`relative ${imageHeight}`}>
        <img
          src={blog.thumbnail}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>

      <div className="p-3 space-y-1">
        <h3
          className={`font-semibold line-clamp-2 ${
            variant === "featured" ? "text-lg" : "text-sm"
          }`}
        >
          {blog.title}
        </h3>

        {variant === "featured" && blog.excerpt && (
          <p className="text-sm text-secondary line-clamp-2">
            {blog.excerpt}
          </p>
        )}

        <div className="text-xs text-secondary">
          {blog.publishedAt} · {blog.author}
        </div>
      </div>
    </Link>
  );
}
