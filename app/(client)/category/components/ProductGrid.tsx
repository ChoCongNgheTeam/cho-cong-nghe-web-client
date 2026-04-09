"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { buildQueryString } from "../_libs/index";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/components/product/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import apiRequest from "@/lib/api";

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
  // {
  //    label: "Bán chạy",
  //    value: "bestseller",
  //    sortBy: "soldCount",
  //    sortOrder: "desc",
  // },
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

// Từ sortBy + sortOrder trên URL → value của SORT_OPTIONS để highlight đúng nút
function resolveSortValue(sortBy: string | null, sortOrder: string | null): string {
  if (!sortBy) return "featured";
  const match = SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.sortOrder === sortOrder);
  return match?.value ?? "featured";
}

// Deduplicate: cùng id → giữ lại theo sort price (min hoặc max), còn lại giữ first
function deduplicateProducts(items: Product[], sortBy: string | null, sortOrder: string | null): Product[] {
  // Gom nhóm theo id
  const groups = new Map<string, Product[]>();
  for (const item of items) {
    const group = groups.get(item.id) ?? [];
    group.push(item);
    groups.set(item.id, group);
  }

  return Array.from(groups.values()).map((group) => {
    if (group.length === 1) return group[0];

    // Sort by price → chọn variant giá min hoặc max để hiển thị đại diện
    if (sortBy === "price") {
      const sorted = [...group].sort((a, b) => {
        const pa = (a as any).price?.final ?? (a as any).priceOrigin ?? 0;
        const pb = (b as any).price?.final ?? (b as any).priceOrigin ?? 0;
        return sortOrder === "asc" ? pa - pb : pb - pa;
      });
      return sorted[0];
    }

    // Default: giữ first (BE đã sort đúng thứ tự)
    return group[0];
  });
}

// Sort client-side cho price vì BE không support orderBy variant price
function sortProducts(items: Product[], sortBy: string | null, sortOrder: string | null): Product[] {
  if (sortBy !== "price") return items;
  return [...items].sort((a, b) => {
    const pa = (a as any).price?.final ?? (a as any).priceOrigin ?? 0;
    const pb = (b as any).price?.final ?? (b as any).priceOrigin ?? 0;
    return sortOrder === "asc" ? pa - pb : pb - pa;
  });
}

async function fetchProductsClient(categorySlug: string, searchParams: URLSearchParams): Promise<{ products: Product[]; pagination: PaginationData }> {
  const paramsRecord: Record<string, string | string[]> = {};
  searchParams.forEach((value, key) => {
    const existing = paramsRecord[key];
    if (existing) {
      paramsRecord[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      paramsRecord[key] = value;
    }
  });

  const page = Number(paramsRecord["page"] ?? 1);
  const sortBy = (paramsRecord["sortBy"] as string) ?? null;
  const sortOrder = (paramsRecord["sortOrder"] as string) ?? null;

  // Với price sort: không gửi sortBy/sortOrder lên BE (BE không support)
  // Các sort khác gửi bình thường
  const paramsForBE = sortBy === "price" ? { ...paramsRecord, sortBy: "createdAt", sortOrder: "desc" } : paramsRecord;

  const qs = buildQueryString(categorySlug, page, paramsForBE);

  const json = await apiRequest.get<{
    data: Product[];
    meta: PaginationData;
  }>(`/products?${qs}`, { noAuth: true });

  const raw = json?.data ?? [];

  // Deduplicate trước, sort price sau
  const deduped = deduplicateProducts(raw, sortBy, sortOrder);
  const sorted = sortProducts(deduped, sortBy, sortOrder);

  return {
    products: sorted,
    pagination: json?.meta ?? { page: 1, limit: 12, total: 0, totalPages: 1 },
  };
}

// ─── FilterAwarePagination ─────────────────────────────────────────────────────
function FilterAwarePagination({ currentPage, totalPages, total }: { currentPage: number; totalPages: number; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  if (totalPages <= 1) return null;

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
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-sm text-primary-light">
        Trang <strong className="text-primary">{currentPage}</strong>
        {" / "}
        <strong className="text-primary">{totalPages}</strong>
        {" · "}
        <strong className="text-primary">{total}</strong> sản phẩm
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-neutral text-primary hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-primary-light text-sm select-none">
              ···
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p as number)}
              className={`min-w-9 h-9 px-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                p === currentPage ? "bg-accent text-white border-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
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
          className="p-2 rounded-lg border border-neutral text-primary hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ProductGrid({ categorySlug, initialProducts = [], initialPagination = { page: 1, limit: 12, total: 0, totalPages: 1 } }: ProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pagination, setPagination] = useState<PaginationData>(initialPagination);

  // Sync activeSort từ URL — đúng khi load lại trang hoặc navigate back/forward
  const activeSort = resolveSortValue(searchParams.get("sortBy"), searchParams.get("sortOrder"));

  const doFetch = useCallback(
    (sp: URLSearchParams) => {
      startTransition(async () => {
        try {
          const result = await fetchProductsClient(categorySlug, sp);
          setProducts(result.products);
          setPagination(result.pagination);
        } catch {
          // giữ data cũ nếu lỗi
        }
      });
    },
    [categorySlug],
  );

  useEffect(() => {
    doFetch(searchParams);
  }, [searchParams.toString()]); // eslint-disable-line

  const handleSort = (option: SortOption) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("sortBy", option.sortBy);
    sp.set("sortOrder", option.sortOrder);
    sp.delete("page");
    // Push URL trước — useEffect sẽ tự fetch khi searchParams thay đổi
    startTransition(() => {
      router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    });
  };

  return (
    <div>
      {/* Sort bar — desktop only */}
      <div className="hidden lg:flex items-center gap-4 flex-wrap mb-4 bg-neutral-light border border-neutral p-4 rounded-xl">
        <span className="text-sm text-primary-light">
          Tìm thấy <strong className="text-primary">{pagination.total}</strong> kết quả
        </span>
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSort(option)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeSort === option.value ? "text-accent bg-accent-light" : "text-primary hover:bg-neutral-light-active"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count — mobile */}
      <div className="lg:hidden mb-3">
        <span className="text-sm text-primary-light">
          Tìm thấy <strong className="text-primary">{pagination.total}</strong> kết quả
        </span>
      </div>

      {/* Grid */}
      <div className={`transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {products.map((product, i) => (
              <ProductCard key={`${product.id}-${i}`} product={product} />
            ))}
          </div>
        ) : (
          !isPending && (
            <div className="flex flex-col items-center justify-center py-20 bg-neutral-light border border-neutral rounded-2xl">
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-base font-semibold text-primary">Không tìm thấy sản phẩm</p>
              <p className="text-sm text-primary-light mt-1">Vui lòng thử lại với bộ lọc khác</p>
            </div>
          )
        )}
      </div>

      <FilterAwarePagination currentPage={pagination.page} totalPages={pagination.totalPages} total={pagination.total} />
    </div>
  );
}
