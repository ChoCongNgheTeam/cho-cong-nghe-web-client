"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { buildQueryString } from "../_libs/fetchProductByCategory";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/components/product/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationData {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
}

interface ProductGridProps {
   categorySlug: string;
   initialProducts?: Product[];
   initialPagination?: PaginationData;
}

type SortOption = {
   label: string;
   value: string;
   sortBy: string;
   sortOrder: string;
};

const SORT_OPTIONS: SortOption[] = [
   {
      label: "Nổi bật",
      value: "featured",
      sortBy: "viewsCount",
      sortOrder: "desc",
   },
   {
      label: "Mới nhất",
      value: "newest",
      sortBy: "createdAt",
      sortOrder: "desc",
   },
   {
      label: "Bán chạy",
      value: "bestseller",
      sortBy: "soldCount",
      sortOrder: "desc",
   },
   {
      label: "Giá tăng dần",
      value: "price_asc",
      sortBy: "price",
      sortOrder: "asc",
   },
   {
      label: "Giá giảm dần",
      value: "price_desc",
      sortBy: "price",
      sortOrder: "desc",
   },
];

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
   const seen = new Set<string>();
   return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
   });
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

async function fetchProductsClient(
   categorySlug: string,
   searchParams: URLSearchParams,
): Promise<{ products: Product[]; pagination: PaginationData }> {
   const paramsRecord: Record<string, string | string[]> = {};
   searchParams.forEach((value, key) => {
      const existing = paramsRecord[key];
      if (existing) {
         paramsRecord[key] = Array.isArray(existing)
            ? [...existing, value]
            : [existing, value];
      } else {
         paramsRecord[key] = value;
      }
   });

   const page = Number(paramsRecord["page"] ?? 1);
   const qs = buildQueryString(categorySlug, page, paramsRecord);

   const res = await fetch(`${BASE_URL}/api/v1/products?${qs}`, {
      credentials: "include",
   });

   if (!res.ok) throw new Error("Fetch failed");
   const json = await res.json();
   return {
      products: deduplicateById(json?.data ?? []),
      pagination: json?.pagination ?? {
         page: 1,
         limit: 12,
         total: 0,
         totalPages: 1,
      },
   };
}

// ─── Inline Pagination — giữ nguyên toàn bộ filter params khi chuyển trang ──
function FilterAwarePagination({
   currentPage,
   totalPages,
}: {
   currentPage: number;
   totalPages: number;
}) {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const goToPage = (page: number) => {
      if (page < 1 || page > totalPages) return;
      // Giữ toàn bộ params hiện tại, chỉ thay page
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
   };

   if (totalPages <= 1) return null;

   // Tính dải trang hiển thị: luôn show 5 trang xung quanh trang hiện tại
   const delta = 2;
   const pages: (number | "...")[] = [];
   const left = Math.max(1, currentPage - delta);
   const right = Math.min(totalPages, currentPage + delta);

   if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
   }
   for (let i = left; i <= right; i++) pages.push(i);
   if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
   }

   return (
      <div className="flex items-center justify-center gap-1 mt-8">
         <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-neutral text-primary hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
         >
            <ChevronLeft className="w-4 h-4" />
         </button>

         {pages.map((p, i) =>
            p === "..." ? (
               <span
                  key={`dots-${i}`}
                  className="px-2 text-primary-light text-sm"
               >
                  ...
               </span>
            ) : (
               <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p as number)}
                  className={`min-w-9 h-9 px-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                     p === currentPage
                        ? "bg-accent text-white border-accent"
                        : "border-neutral text-primary hover:bg-neutral-light-active"
                  }`}
               >
                  {p}
               </button>
            ),
         )}

         <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-neutral text-primary hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed  cursor-pointer transition-colors"
         >
            <ChevronRight className="w-4 h-4" />
         </button>
      </div>
   );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductGrid({
   categorySlug,
   initialProducts = [],
   initialPagination = { page: 1, limit: 12, total: 0, totalPages: 1 },
}: ProductGridProps) {
   const searchParams = useSearchParams();
   const [isPending, startTransition] = useTransition();

   const [products, setProducts] = useState<Product[]>(initialProducts);
   const [pagination, setPagination] =
      useState<PaginationData>(initialPagination);
   const [activeSort, setActiveSort] = useState("featured");

   const doFetch = useCallback(
      (sp: URLSearchParams) => {
         startTransition(async () => {
            try {
               const result = await fetchProductsClient(categorySlug, sp);
               setProducts(result.products);
               setPagination(result.pagination);
            } catch {
               // giữ data cũ, tránh màn hình trắng
            }
         });
      },
      [categorySlug],
   );

   // Re-fetch khi URL params thay đổi (filter / page)
   useEffect(() => {
      doFetch(searchParams);
   }, [searchParams.toString()]); // eslint-disable-line

   const handleSort = (option: SortOption) => {
      setActiveSort(option.value);
      // Sort không push URL — chỉ fetch lại với sort params, giữ filter params
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("sortBy", option.sortBy);
      sp.set("sortOrder", option.sortOrder);
      sp.delete("page");
      doFetch(sp);
   };

   return (
      <div>
         {/* Sort + result count */}
         <div className="flex items-center gap-4 flex-wrap mb-4 bg-neutral-light border border-neutral p-4 rounded-xl">
            <span className="text-sm text-primary-light">
               Tìm thấy{" "}
               <strong className="text-primary">{pagination.total}</strong> kết
               quả
            </span>
            <div className="flex items-center gap-2 flex-wrap ml-auto">
               {SORT_OPTIONS.map((option) => (
                  <button
                     key={option.value}
                     type="button"
                     onClick={() => handleSort(option)}
                     className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                        activeSort === option.value
                           ? "text-accent bg-accent-light"
                           : "text-primary hover:bg-neutral-light-active"
                     }`}
                  >
                     {option.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Grid */}
         <div
            className={`transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}
         >
            {products.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product, i) => (
                     <ProductCard
                        key={`${product.id}-${i}`}
                        product={product}
                     />
                  ))}
               </div>
            ) : (
               !isPending && (
                  <div className="flex flex-col items-center justify-center py-20 bg-neutral-light border border-neutral rounded-2xl">
                     <span className="text-5xl mb-4">🔍</span>
                     <p className="text-base font-semibold text-primary">
                        Không tìm thấy sản phẩm
                     </p>
                     <p className="text-sm text-primary-light mt-1">
                        Vui lòng thử lại với bộ lọc khác
                     </p>
                  </div>
               )
            )}
         </div>

         {/* Pagination — dùng component inline để giữ filter params */}
         <FilterAwarePagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
         />
      </div>
   );
}
