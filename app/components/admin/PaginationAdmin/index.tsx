"use client";

import {
   ChevronLeft,
   ChevronRight,
   ChevronsLeft,
   ChevronsRight,
} from "lucide-react";
import { getPageRange } from "./getPageRange";

export interface AdminPaginationProps {
   currentPage: number;
   totalPages: number;
   total: number;
   pageSize: number;
   onPageChange: (page: number) => void;
   onPageSizeChange?: (size: number) => void;
   pageSizeOptions?: number[];
   siblingCount?: number;
   className?: string;
}

export default function AdminPagination({
   currentPage,
   totalPages,
   total,
   pageSize,
   onPageChange,
   onPageSizeChange,
   pageSizeOptions = [10, 20, 50],
   siblingCount = 1,
   className = "",
}: AdminPaginationProps) {
   if (totalPages <= 0) return null;

   const pages = getPageRange(currentPage, totalPages, siblingCount);

   const rangeStart = (currentPage - 1) * pageSize + 1;
   const rangeEnd = Math.min(currentPage * pageSize, total);

   const iconBtnBase =
      "w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer" +
      "text-primary cursor-pointer" +
      "hover:bg-neutral-light-active hover:text-primary cursor-pointer" +
      "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary cursor-pointer";

   return (
      <div
         className={`flex items-center justify-between flex-wrap gap-3 ${className}`}
      >
         <div className="flex items-center gap-3">
            {onPageSizeChange && (
               <div className="flex items-center gap-2">
                  <select
                     value={pageSize}
                     onChange={(e) => {
                        onPageSizeChange(Number(e.target.value));
                        onPageChange(1);
                     }}
                     className="px-2 py-1.5  text-[13px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
                  >
                     {pageSizeOptions.map((n) => (
                        <option key={n} value={n}>
                           {n}
                        </option>
                     ))}
                  </select>
                  <span className=" text-[13px] text-primary whitespace-nowrap">
                     dòng / trang
                  </span>
               </div>
            )}

            <span className=" text-[13px] text-primary whitespace-nowrap">
               {rangeStart}–{rangeEnd}{" "}
               <span className="text-primary/60/60">trong {total} kết quả</span>
            </span>
         </div>

         {/* ── Right: page controls ── */}
         <div className="flex items-center gap-1">
            {/* First */}
            <button
               disabled={currentPage === 1}
               onClick={() => onPageChange(1)}
               className={iconBtnBase}
               aria-label="Trang đầu"
            >
               <ChevronsLeft size={14} />
            </button>

            {/* Prev */}
            <button
               disabled={currentPage === 1}
               onClick={() => onPageChange(currentPage - 1)}
               className={iconBtnBase}
               aria-label="Trang trước"
            >
               <ChevronLeft size={14} />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-0.5 mx-1">
               {pages.map((p, i) =>
                  p === "..." ? (
                     <span
                        key={`ellipsis-${i}`}
                        className="w-7 h-7 flex items-end justify-center pb-1.5  text-[11px] text-primary tracking-widest select-none"
                     >
                        ···
                     </span>
                  ) : (
                     <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg  text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                           p === currentPage
                              ? "bg-accent text-white shadow-sm shadow-accent/25 scale-105"
                              : "text-primary hover:bg-neutral-light-active"
                        }`}
                        aria-current={p === currentPage ? "page" : undefined}
                     >
                        {p}
                     </button>
                  ),
               )}
            </div>

            {/* Next */}
            <button
               disabled={currentPage === totalPages}
               onClick={() => onPageChange(currentPage + 1)}
               className={iconBtnBase}
               aria-label="Trang sau"
            >
               <ChevronRight size={14} />
            </button>

            {/* Last */}
            <button
               disabled={currentPage === totalPages}
               onClick={() => onPageChange(totalPages)}
               className={iconBtnBase}
               aria-label="Trang cuối"
            >
               <ChevronsRight size={14} />
            </button>

            {/* Page indicator */}
            <span className="ml-2  text-[13px] text-primary whitespace-nowrap">
               {currentPage} / {totalPages}
            </span>
         </div>
      </div>
   );
}
