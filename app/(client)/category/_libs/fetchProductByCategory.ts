import apiRequest from "@/lib/api";
import { Pagination, Product, ProductListResponse } from "../types";

interface FetchProductsResult {
   products: Product[];
   pagination: Pagination;
}

export async function fetchProducts(
   categorySlug: string,
   page: number,
): Promise<FetchProductsResult> {
   const res = await apiRequest.get<ProductListResponse>("/products", {
      params: { category: categorySlug, page },
      noAuth: true,
   });
   return {
      products: res.data ?? [],
      pagination: res.pagination,
   };
}
