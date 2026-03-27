"use client";
import { useSearchParams } from "next/navigation";
import {
   useEffect,
   useRef,
   useState,
   useTransition,
   useDeferredValue,
   Suspense,
} from "react";
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

const searchCache = new Map<string, SearchProduct[]>();

function useDebounce<T>(value: T, delay: number): T {
   const [debounced, setDebounced] = useState<T>(value);

   useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
   }, [value, delay]);

   return debounced;
}

function SearchContent() {
   const searchParams = useSearchParams();
   const q = searchParams.get("q") ?? "";

   // 1. Debounce raw query → chỉ thay đổi sau 400ms không gõ
   const debouncedQ = useDebounce(q, 400);

   // 2. Defer thêm 1 lớp để React không block UI khi reconcile
   const deferredQ = useDeferredValue(debouncedQ);

   const [products, setProducts] = useState<SearchProduct[]>([]);
   const [isPending, startTransition] = useTransition();
   const abortRef = useRef<AbortController | null>(null);

   // 3. Effect chỉ chạy khi deferredQ thay đổi — không chạy mỗi keystroke
   useEffect(() => {
      if (!deferredQ) {
         setProducts([]);
         return;
      }

      // Cache hit → không fetch
      if (searchCache.has(deferredQ)) {
         startTransition(() => setProducts(searchCache.get(deferredQ)!));
         return;
      }

      // Hủy request cũ
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      apiRequest
         .get<SearchResponse>("/search", {
            params: { q: deferredQ, limit: 24 },
            noAuth: true,
            signal: controller.signal,
         })
         .then((res) => {
            const results = res.data ?? [];
            searchCache.set(deferredQ, results);
            startTransition(() => setProducts(results));
         })
         .catch((err: unknown) => {
            if (err instanceof Error && err.name === "AbortError") return;
            startTransition(() => setProducts([]));
         });

      return () => {
         abortRef.current?.abort();
      };
   }, [deferredQ]);

   // isPending = true khi deferredQ chưa "bắt kịp" debouncedQ
   const isStale = q !== deferredQ;

   return (
      <div className="container py-6">
         <h1 className="text-xl font-bold mb-4">
            Kết quả tìm kiếm: <span className="text-accent">"{q}"</span>
         </h1>
         {isPending || isStale ? (
            <p className="text-neutral-dark">Đang tìm kiếm...</p>
         ) : products.length === 0 ? (
            <p className="text-neutral-dark">
               Không tìm thấy sản phẩm nào cho "{q}"
            </p>
         ) : (
            <div>{/* TODO: Render ProductGrid ở đây */}</div>
         )}
      </div>
   );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function SearchPage() {
   return (
      <Suspense
         fallback={
            <div className="container py-6">
               <div className="h-8 w-64 bg-neutral animate-pulse rounded mb-4" />
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                     <div
                        key={i}
                        className="h-64 bg-neutral animate-pulse rounded-xl"
                     />
                  ))}
               </div>
            </div>
         }
      >
         <SearchContent />
      </Suspense>
   );
}
