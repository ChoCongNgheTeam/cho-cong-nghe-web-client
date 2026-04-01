import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/helpers/formatDate";
import { formatViews } from "@/helpers/formatViews";
import { Blog } from "../types/blog.type";

export default function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block overflow-hidden rounded-2xl border border-neutral/60 bg-neutral-light/80 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={blog.thumbnail || "/images/avatar.png"}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/15 via-black/5 to-transparent" />

        <div className="absolute top-3 right-3 bg-white/70 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 text-primary/80 text-xs shadow-sm border border-white/60">
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

        <div className="absolute bottom-0 inset-x-0 p-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-2.5 py-1 backdrop-blur border border-white/60 text-xs">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary/70 text-xs font-semibold">
                {blog.author.fullName.charAt(0)}
              </span>
            </div>
            <span className="text-primary/80 font-medium truncate">
              {blog.author.fullName}
            </span>
            <span className="text-primary/40">•</span>
            <span className="text-primary/60 shrink-0">
              {formatDate(blog.publishedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <h3 className="text-base md:text-lg font-semibold text-primary leading-snug tracking-tight line-clamp-2 group-hover:text-accent transition-colors duration-200">
          {blog.title}
        </h3>
      </div>
    </Link>
  );
}
