import apiRequest from "@/lib/api";
import { useState, useEffect, useRef, useCallback } from "react";

export interface SearchProduct {
   id: string;
   name: string;
   slug: string;
   price: number;
   originalPrice?: number;
   discountPercent?: number;
   thumbnail: string;
}

interface SearchResponse {
   data: SearchProduct[];
   // thêm các field khác nếu API trả về
}

export function useProductSearch(delay = 350) {
   const [query, setQuery] = useState("");
   const [results, setResults] = useState<SearchProduct[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [isOpen, setIsOpen] = useState(false);
   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const abortRef = useRef<AbortController | null>(null);

   const search = useCallback(async (q: string) => {
      if (!q.trim()) {
         setResults([]);
         setIsOpen(false);
         return;
      }

      // Hủy request trước nếu còn đang chạy
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      try {
         const res = await apiRequest.get<SearchResponse>("/products", {
            params: { search: q },
            noAuth: true,
         });
         setResults(res?.data ?? []);
         setIsOpen(true);
      } catch {
         setResults([]);
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(query), delay);
      return () => {
         if (debounceRef.current) clearTimeout(debounceRef.current);
      };
   }, [query, delay, search]);

   const clear = useCallback(() => {
      setQuery("");
      setResults([]);
      setIsOpen(false);
   }, []);

   return { query, setQuery, results, isLoading, isOpen, setIsOpen, clear };
}
