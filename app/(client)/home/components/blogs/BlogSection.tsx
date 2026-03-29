"use client";

import Link from "next/link";
import { Slidezy } from "@/components/Slider";
import { BlogCard } from "./BlogCard";
import { Blog } from "../../_libs";

interface BlogSectionProps {
   blogs: Blog[];
}

export function BlogSection({ blogs }: BlogSectionProps) {
   return (
      <section className="py-4 md:py-6 bg-linear-to-b from-neutral-light to-neutral-light-active">
         <div className="container">

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                     Bài viết
                  </h2>
                  <p className="text-sm text-primary/60 mt-0.5">
                     Tin tức và đánh giá sản phẩm mới nhất
                  </p>
               </div>

               <Link
                  href="/blog"
                  className="hidden md:flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all duration-300 group"
               >
                  <span>Xem tất cả</span>
                  <svg
                     className="w-5 h-5 transition-transform group-hover:translate-x-1"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
               </Link>
            </div>

            {/* Desktop — 3 cột, items-stretch để cột giữa cao bằng cột ngoài */}
            <div className="hidden md:grid md:grid-cols-3 gap-3 items-stretch">
               {/* Cột 1 — 3 card nhỏ */}
               <div className="flex flex-col gap-3">
                  {blogs.slice(0, 3).map((blog) => (
                     <BlogCard key={blog.id} blog={blog} />
                  ))}
               </div>

               {/* Cột 2 — 1 card tall, h-full để thumbnail tự grow */}
               <div className="flex flex-col">
                  {blogs.slice(3, 4).map((blog) => (
                     <BlogCard key={blog.id} blog={blog} isTall />
                  ))}
               </div>

               {/* Cột 3 — 3 card nhỏ */}
               <div className="flex flex-col gap-3">
                  {blogs.slice(4, 7).map((blog) => (
                     <BlogCard key={blog.id} blog={blog} />
                  ))}
               </div>
            </div>

            {/* ── Mobile: Slider ── */}
            <div className="md:hidden">
               <Slidezy
                  items={{ mobile: 1, tablet: 2, desktop: 3 }}
                  gap={16}
                  speed={400}
                  loop={false}
                  nav={false}
                  controls={true}
                  slideBy={1}
                  draggable={true}
               >
                  {blogs.map((blog) => (
                     <BlogCard key={blog.id} blog={blog} />
                  ))}
               </Slidezy>
            </div>

            {/* ── Mobile CTA ── */}
            <div className="flex justify-center mt-8 md:hidden">
               <Link
                  href="/blog"
                  className="flex items-center gap-2 bg-accent text-neutral-light font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-accent-hover"
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