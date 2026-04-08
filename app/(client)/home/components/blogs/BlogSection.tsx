"use client";

import Link from "next/link";
import { Slidezy } from "@/components/Slider";
import BlogCard from "@/(client)/blog/components/BlogCard";
import { Blog } from "@/(client)/blog/types/blog.type";

interface BlogSectionProps {
  blogs: Blog[];
}

export function BlogSection({ blogs }: BlogSectionProps) {
  const displayBlogs = blogs.slice(0, 4);

  return (
    <section className="py-6 md:py-10 bg-neutral-light-active">
      <div className="container">
        {/* header */}
        <div className="flex items-center justify-between mb-5 md:mb-7">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">Bài viết</h2>
            <p className="text-sm text-primary/60 mt-0.5">Tin tức và đánh giá sản phẩm mới nhất</p>
          </div>
          <Link href="/blog" className="hidden md:flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all duration-300 group">
            <span>Xem tất cả</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* grid desktop */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} variant="home" />
          ))}
        </div>

        {/* mobile slider */}
        <div className="sm:hidden">
          <Slidezy items={{ mobile: 1, tablet: 2, desktop: 2 }} gap={12} speed={400} loop={false} nav={false} mobileNav="dots" controls={false} slideBy={1} draggable>
            {displayBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} variant="home" />
            ))}
          </Slidezy>
        </div>

        {/* mobile button */}
        <div className="flex justify-center mt-6 sm:hidden">
          <Link
            href="/blog"
            className="flex items-center gap-2 bg-accent text-neutral-light font-bold px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-accent-hover"
          >
            <span>Xem tất cả bài viết</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
