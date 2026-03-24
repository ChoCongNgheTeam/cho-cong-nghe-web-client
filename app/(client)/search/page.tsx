"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, Suspense } from "react";
import apiRequest from "@/lib/api";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  priceOrigin: number;
  inStock: boolean;
  price: {
    base: number;
    final: number;
    hasPromotion: boolean;
    discountPercentage: number;
  } | null;
  rating: { average: number; count: number };
}

interface SearchResponse {
  data: SearchProduct[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  message: string;
}

// ← Tách ra component riêng để wrap Suspense
function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!q) return;

    let cancelled = false;

    apiRequest
      .get<SearchResponse>("/search", { params: { q, limit: 24 }, noAuth: true })
      .then((res) => {
        if (cancelled) return;
        startTransition(() => setProducts(res.data ?? []));
      })
      .catch(() => {
        if (!cancelled) startTransition(() => setProducts([]));
      });

    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="container py-6">
      <h1 className="text-xl font-bold mb-4">
        Kết quả tìm kiếm: <span className="text-accent">"{q}"</span>
      </h1>
      {isPending ? (
        <p className="text-neutral-dark">Đang tìm kiếm...</p>
      ) : products.length === 0 ? (
        <p className="text-neutral-dark">Không tìm thấy sản phẩm nào cho "{q}"</p>
      ) : (
        <div>{/* TODO: Render ProductGrid ở đây */}</div>
      )}
    </div>
  );
}

// ← Page export wrap SearchContent trong Suspense
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-6">
          <div className="h-8 w-64 bg-neutral animate-pulse rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-neutral animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
