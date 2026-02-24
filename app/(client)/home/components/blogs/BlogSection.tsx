"use client";

import Image from "next/image";
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
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                     Bài viết
                  </h2>
                  <p className="text-primary">
                     Tin tức và đánh giá sản phẩm mới nhất
                  </p>
               </div>
               <Link
                  href="/blog"
                  className="hidden md:flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all duration-300 group"
               >
                  <span>Xem tất cả</span>
                  <svg
                     className="w-5 h-5 transform transition-transform group-hover:translate-x-1"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                     />
                  </svg>
               </Link>
            </div>

            {/* Desktop - giữ layout 3 cột */}
            <div className="hidden md:grid md:grid-cols-3 gap-3">
               <div className="flex flex-col gap-3">
                  {blogs.slice(0, 3).map((blog) => (
                     <BlogCard key={blog.id} blog={blog} />
                  ))}
               </div>
               <div className="flex flex-col gap-3">
                  {blogs.slice(3, 4).map((blog) => (
                     <BlogCard key={blog.id} blog={blog} isTall={true} />
                  ))}
               </div>
               <div className="flex flex-col gap-3">
                  {blogs.slice(4, 7).map((blog) => (
                     <BlogCard key={blog.id} blog={blog} />
                  ))}
               </div>
            </div>

            {/* Mobile - Slidezy */}
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

            <div className="flex justify-center mt-8 md:hidden">
               <Link
                  href="/blog"
                  className="flex items-center gap-2 bg-accent text-neutral-light font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-accent-hover"
               >
                  <span>Xem tất cả bài viết</span>
                  <svg
                     className="w-5 h-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                     />
                  </svg>
               </Link>
            </div>
         </div>
      </section>
   );
}
