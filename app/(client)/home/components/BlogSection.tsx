"use client";

import Image from "next/image";
import Link from "next/link";
import { BlogDTO } from "@/lib/api-demo";

interface BlogSectionProps {
   blogs: BlogDTO[];
}

export default function BlogSection({ blogs }: BlogSectionProps) {
   const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("vi-VN", {
         day: "2-digit",
         month: "2-digit",
         year: "numeric",
      }).format(new Date(date));
   };

   const formatViews = (count: number) => {
      if (count >= 1000) {
         return `${(count / 1000).toFixed(1)}K`;
      }
      return count.toString();
   };

   // Chia blogs thành 3 cột
   const column1 = blogs.slice(0, 3); // 3 bài đầu tiên
   const column2 = blogs.slice(3, 4); // 1 bài ở giữa
   const column3 = blogs.slice(4, 7); // 3 bài cuối

   const BlogCard = ({
      blog,
      isTall = false,
   }: {
      blog: BlogDTO;
      isTall?: boolean;
   }) => (
      <Link
         href={`/blog/${blog.slug}`}
         className="group relative flex flex-col bg-neutral-light rounded-xl shadow-md transition-all duration-500 overflow-hidden"
      >
         <div
            className={`relative ${isTall ? "h-180" : "h-57.5"} overflow-hidden bg-linear-to-br from-neutral-light-active to-neutral-hover`}
         >
            <Image
               src={blog.thumbnail}
               alt={blog.title}
               fill
               
               className="object-cover transition-transform duration-700 group-hover:scale-110"
               sizes="(max-width: 768px) 100vw, 33vw"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-3 left-3 bg-promotion text-neutral-light text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
               Review
            </div>

            {/* Read Time Badge */}
            <div className="absolute top-3 right-3 bg-neutral-light/90 backdrop-blur-sm text-primary text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
               <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
               >
                  <path
                     fillRule="evenodd"
                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                     clipRule="evenodd"
                  />
               </svg>
               5 phút đọc
            </div>

            {/* Content hiển thị khi hover */}
            <div className="absolute inset-x-0 bottom-0 p-4 transform">
               {/* Author & Date */}
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-promotion-light-active to-orange-500 flex items-center justify-center">
                     <span className="text-neutral-light font-bold text-xs">
                        {blog.author.full_name.charAt(0)}
                     </span>
                  </div>
                  <span className="text-xs font-medium text-neutral-light">
                     {blog.author.full_name}
                  </span>
                  <span className="text-neutral-light/60">•</span>
                  <span className="text-xs text-neutral-light/90">
                     {formatDate(blog.created_at)}
                  </span>
               </div>

               {/* Title */}
               <h3
                  className={`${isTall ? "text-lg" : "text-sm"} font-bold text-neutral-light mb-2 line-clamp-2 leading-tight`}
               >
                  {blog.title}
               </h3>

               {/* Footer */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-neutral-light/90">
                     {/* Views */}
                     <div className="flex items-center gap-1">
                        <svg
                           className="w-3.5 h-3.5"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                        >
                           <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                           <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                           />
                        </svg>
                        <span className="font-semibold">
                           {formatViews(blog.view_count)}
                        </span>
                     </div>

                     {/* Comments */}
                     <div className="flex items-center gap-1">
                        <svg
                           className="w-3.5 h-3.5"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                        >
                           <path
                              fillRule="evenodd"
                              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                              clipRule="evenodd"
                           />
                        </svg>
                        <span className="font-semibold">24</span>
                     </div>
                  </div>

                  {/* Read More Link */}
                  <div className="flex items-center gap-1 text-promotion-light font-bold text-sm">
                     <span>Đọc thêm</span>
                     <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2.5}
                           d="M9 5l7 7-7 7"
                        />
                     </svg>
                  </div>
               </div>
            </div>
         </div>

         {/* Hover Border Effect */}
         <div className="absolute inset-0 border-2 border-promotion rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>
   );

   return (
      <section className="py-4 md:py-6 bg-linear-to-b from-white to-neutral-light">
         <div className="container">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                     Bài viết
                  </h2>
                  <p className="text-primary-light-hover">
                     Tin tức và đánh giá sản phẩm mới nhất
                  </p>
               </div>

               <Link
                  href="/blog"
                  className="hidden md:flex items-center gap-2 text-promotion font-bold hover:gap-3 transition-all duration-300 group"
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

            {/* Blog Grid - Desktop */}
            <div className="hidden md:grid md:grid-cols-3 gap-3">
               {/* Column 1 - 3 hình nhỏ xếp thẳng */}
               <div className="flex flex-col gap-3">
                  {column1.map((blog) => (
                     <BlogCard key={blog.id} blog={blog} />
                  ))}
               </div>

               {/* Column 2 - 1 hình to ở giữa */}
               <div className="flex flex-col gap-3">
                  {column2.map((blog) => (
                     <BlogCard key={blog.id} blog={blog} isTall={true} />
                  ))}
               </div>

               {/* Column 3 - 3 hình nhỏ xếp thẳng */}
               <div className="flex flex-col gap-3">
                  {column3.map((blog) => (
                     <BlogCard key={blog.id} blog={blog} />
                  ))}
               </div>
            </div>

            {/* Blog Grid - Mobile */}
            <div className="grid grid-cols-1 md:hidden gap-4">
               {blogs.slice(0, 6).map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
               ))}
            </div>

            {/* Mobile View All Button */}
            <div className="flex justify-center mt-8 md:hidden">
               <Link
                  href="/blog"
                  className="flex items-center gap-2 bg-promotion text-neutral-light font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-promotion-hover"
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
