import Image from "next/image";
import Link from "next/link";
import { Blog } from "../../_libs";
import { formatDate } from "@/helpers/formatDate";
import { formatViews } from "@/helpers/formatViews";

export const BlogCard = ({
   blog,
   isTall = false,
}: {
   blog: Blog;
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

         <div className="absolute top-3 left-3 bg-promotion text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Review
         </div>

         <div className="absolute top-3 right-3 bg-neutral-light backdrop-blur-sm text-primary text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
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

         <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-7 h-7 rounded-full bg-linear-to-br from-promotion-light-active to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                     {blog.author.fullName.charAt(0)}
                  </span>
               </div>
               <span className="text-xs font-medium text-white">
                  {blog.author.fullName}
               </span>
               <span className="text-white/60">•</span>
               <span className="text-xs text-white/90">
                  {formatDate(blog.publishedAt)}
               </span>
            </div>

            <h3
               className={`${isTall ? "text-lg" : "text-sm"} font-bold text-white mb-2 line-clamp-2 leading-tight`}
            >
               {blog.title}
            </h3>

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3 text-xs text-white/90">
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
                        {formatViews(blog.viewCount)}
                     </span>
                  </div>
               </div>

               <div className="flex items-center gap-1 text-white font-bold text-sm">
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

      <div className="absolute inset-0 border-2 border-promotion rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
   </Link>
);
