import Image from "next/image";
import Link from "next/link";
import { Blog } from "../../_libs";
import { formatDate } from "@/helpers/formatDate";
import { formatViews } from "@/helpers/formatViews";

interface BlogCardProps {
  blog: Blog;
}

export const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block overflow-hidden rounded-2xl bg-neutral-light shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={blog.thumbnail}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />

        {/* views - góc phải */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 text-white text-xs shadow">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z"
              clipRule="evenodd"
            />
          </svg>
          <span>{formatViews(blog.viewCount)}</span>
        </div>

        {/* author - bottom overlay */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-promotion flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {blog.author.fullName.charAt(0)}
              </span>
            </div>
            <span className="text-xs font-medium text-white truncate">
              {blog.author.fullName}
            </span>
            <span className="text-white/60">•</span>
            <span className="text-xs text-white/80 shrink-0">
              {formatDate(blog.publishedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* title - ngoài ảnh */}
      <div className="p-3 md:p-4">
        <h3 className="text-sm md:text-base font-semibold text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
          {blog.title}
        </h3>
      </div>
    </Link>
  );
};