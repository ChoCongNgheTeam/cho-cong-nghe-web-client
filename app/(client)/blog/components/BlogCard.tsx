import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/helpers/formatDate";
import { formatViews } from "@/helpers/formatViews";
import { getBlogTypeLabel } from "../_lib/blog-category";
import { Blog } from "../types/blog.type";

/**
 * variant="home"  — dùng trên trang chủ (overlay đậm hơn, không có type badge)
 * variant="list"  — dùng trên /blog (overlay nhẹ, có type badge)
 */
interface BlogCardProps {
  blog: Blog;
  variant?: "home" | "list";
}

export default function BlogCard({ blog, variant = "list" }: BlogCardProps) {
  const isHome = variant === "home";
  const typeLabel = getBlogTypeLabel(blog.type);

  return (
    <Link href={`/blog/${blog.slug}`} className="group block overflow-hidden rounded-2xl bg-neutral-light border-neutral-100 hover:shadow-md transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={blog.thumbnail || "/images/avatar.png"}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Gradient overlay — đậm hơn ở home */}
        <div className={`absolute inset-0 bg-linear-to-t to-transparent ${isHome ? "from-black/60 via-black/20" : "from-black/50 via-black/10"}`} />

        {/* Type badge — chỉ trên /blog */}
        {!isHome && typeLabel && (
          <div className="absolute top-3 left-3 bg-accent/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-white text-[10px] font-semibold tracking-wide shadow">{typeLabel}</div>
        )}

        {/* Views — góc phải trên */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-white text-xs shadow">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z" clipRule="evenodd" />
          </svg>
          <span>{formatViews(blog.viewCount)}</span>
        </div>

        {/* Author — bottom overlay */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <div className="flex items-center gap-2">
            {/* Avatar: ảnh thật nếu có, fallback chữ cái */}
            {blog.author.avatarImage ? (
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-white/60">
                <Image src={blog.author.avatarImage} alt={blog.author.fullName} fill className="object-cover" sizes="28px" />
              </div>
            ) : (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-accent/80 flex items-center justify-center shrink-0 ring-1 ring-white/40">
                <span className="text-white text-[10px] font-bold">{blog.author.fullName.charAt(0).toUpperCase()}</span>
              </div>
            )}

            <span className="text-xs font-medium text-white drop-shadow truncate">{blog.author.fullName}</span>
            <span className="text-white/50 text-xs">•</span>
            <span className="text-xs text-white/80 drop-shadow shrink-0">{formatDate(blog.publishedAt)}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="p-3 md:p-4">
        <h3 className="text-sm md:text-base font-semibold text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">{blog.title}</h3>
      </div>
    </Link>
  );
}
