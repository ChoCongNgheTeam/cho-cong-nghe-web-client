"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
   currentPage: number;
   totalPages: number;
   basePath: string;
   siblingCount?: number;
   className?: string;
}

function getPageRange(
   current: number,
   total: number,
   siblings: number,
): (number | "...")[] {
   const pages: (number | "...")[] = [];
   let prev: number | null = null;

   for (let i = 1; i <= total; i++) {
      if (
         i === 1 ||
         i === total ||
         (i >= current - siblings && i <= current + siblings)
      ) {
         if (prev !== null && i - prev > 1) pages.push("...");
         pages.push(i);
         prev = i;
      }
   }
   return pages;
}

export default function Pagination({
   currentPage,
   totalPages,
   basePath,
   siblingCount = 2,
   className = "",
}: PaginationProps) {
   if (totalPages <= 1) return null;

   const pages = getPageRange(currentPage, totalPages, siblingCount);
   const href = (page: number) => `${basePath}?page=${page}`;

   return (
      <nav
         aria-label="Phân trang"
         className={`flex items-center justify-center gap-1 ${className}`}
      >
         {/* Prev */}
         {currentPage === 1 ? (
            <span
               className="
               inline-flex items-center gap-1.5 h-9 px-3 rounded-full
               text-xs font-medium text-neutral-dark
               border border-neutral bg-neutral-light
               opacity-40 cursor-not-allowed select-none
            "
            >
               <ChevronLeft className="w-3.5 h-3.5" />
               Trước
            </span>
         ) : (
            <Link
               href={href(currentPage - 1)}
               className="
               inline-flex items-center gap-1.5 h-9 px-3 rounded-full
               text-xs font-medium text-primary
               border border-neutral bg-neutral-light
               hover:border-accent hover:text-accent hover:bg-accent-light
               transition-all duration-200
            "
            >
               <ChevronLeft className="w-3.5 h-3.5" />
               Trước
            </Link>
         )}

         {/* Divider */}
         <div className="w-px h-5 bg-neutral mx-1" />

         {/* Pages */}
         <div className="flex items-center gap-1">
            {pages.map((p, i) =>
               p === "..." ? (
                  <span
                     key={`e-${i}`}
                     className="inline-flex items-end justify-center w-8 h-9 pb-2 text-xs text-neutral-dark tracking-widest select-none"
                  >
                     ···
                  </span>
               ) : p === currentPage ? (
                  <span
                     key={p}
                     className="
                        relative inline-flex items-center justify-center
                        w-9 h-9 rounded-full
                        text-sm font-bold text-white
                        bg-accent shadow-md shadow-accent/30
                        cursor-default select-none
                     "
                  >
                     {/* Glow ring */}
                     <span className="absolute inset-0 rounded-full ring-2 ring-accent/30 ring-offset-1" />
                     {p}
                  </span>
               ) : (
                  <Link
                     key={p}
                     href={href(p)}
                     className="
                        inline-flex items-center justify-center
                        w-9 h-9 rounded-full
                        text-sm font-medium text-primary
                        border border-transparent
                        hover:border-neutral hover:bg-neutral-light-active
                        transition-all duration-150
                     "
                  >
                     {p}
                  </Link>
               ),
            )}
         </div>

         {/* Divider */}
         <div className="w-px h-5 bg-neutral mx-1" />

         {/* Next */}
         {currentPage === totalPages ? (
            <span
               className="
               inline-flex items-center gap-1.5 h-9 px-3 rounded-full
               text-xs font-medium text-neutral-dark
               border border-neutral bg-neutral-light
               opacity-40 cursor-not-allowed select-none
            "
            >
               Sau
               <ChevronRight className="w-3.5 h-3.5" />
            </span>
         ) : (
            <Link
               href={href(currentPage + 1)}
               className="
               inline-flex items-center gap-1.5 h-9 px-3 rounded-full
               text-xs font-medium text-primary
               border border-neutral bg-neutral-light
               hover:border-accent hover:text-accent hover:bg-accent-light
               transition-all duration-200
            "
            >
               Sau
               <ChevronRight className="w-3.5 h-3.5" />
            </Link>
         )}
      </nav>
   );
}
