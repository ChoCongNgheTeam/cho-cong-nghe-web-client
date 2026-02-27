"use client";

import {
   ChevronLeft,
   ChevronRight,
   ChevronsLeft,
   ChevronsRight,
} from "lucide-react";
import { getPageRange } from "./getPageRange";

export interface AdminPaginationProps {
   /** Trang hiện tại (bắt đầu từ 1) */
   currentPage: number;
   /** Tổng số trang */
   totalPages: number;
   /** Tổng số item */
   total: number;
   /** Số item mỗi trang */
   pageSize: number;
   /** Callback khi đổi trang */
   onPageChange: (page: number) => void;
   /** Callback khi đổi số item/trang */
   onPageSizeChange?: (size: number) => void;
   /** Các lựa chọn số item/trang */
   pageSizeOptions?: number[];
   /** Số trang anh em mỗi bên trang hiện tại */
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
      "text-neutral-dark dark:text-neutral-dark cursor-pointer" +
      "hover:bg-neutral-light-active dark:hover:bg-neutral hover:text-primary dark:hover:text-primary cursor-pointer" +
      "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-dark cursor-pointer";

   return (
      <div
         className={`flex items-center justify-between flex-wrap gap-3 ${className}`}
      >
         {/* ── Left: page size selector + range info ── */}
         <div className="flex items-center gap-3">
            {onPageSizeChange && (
               <div className="flex items-center gap-2">
                  <select
                     value={pageSize}
                     onChange={(e) => {
                        onPageSizeChange(Number(e.target.value));
                        onPageChange(1);
                     }}
                     className="px-2 py-1.5 font-inters text-[12px] border border-neutral dark:border-neutral rounded-lg bg-neutral-light dark:bg-neutral-light text-primary dark:text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
                  >
                     {pageSizeOptions.map((n) => (
                        <option key={n} value={n}>
                           {n}
                        </option>
                     ))}
                  </select>
                  <span className="font-inters text-[12px] text-neutral-dark dark:text-neutral-dark whitespace-nowrap">
                     dòng / trang
                  </span>
               </div>
            )}

            <span className="font-inters text-[12px] text-neutral-dark dark:text-neutral-dark whitespace-nowrap">
               {rangeStart}–{rangeEnd}{" "}
               <span className="text-neutral-dark/60 dark:text-neutral-dark/60">
                  trong {total} kết quả
               </span>
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
                        className="w-7 h-7 flex items-end justify-center pb-1.5 font-inters text-[11px] text-neutral-dark dark:text-neutral-dark tracking-widest select-none"
                     >
                        ···
                     </span>
                  ) : (
                     <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg font-inters text-[12px] font-medium transition-all duration-150 cursor-pointer ${
                           p === currentPage
                              ? "bg-accent text-white shadow-sm shadow-accent/25 scale-105"
                              : "text-primary-light dark:text-primary-light hover:bg-neutral-light-active dark:hover:bg-neutral hover:text-primary dark:hover:text-primary"
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
            <span className="ml-2 font-inters text-[12px] text-neutral-dark dark:text-neutral-dark whitespace-nowrap">
               {currentPage} / {totalPages}
            </span>
         </div>
      </div>
   );
}
