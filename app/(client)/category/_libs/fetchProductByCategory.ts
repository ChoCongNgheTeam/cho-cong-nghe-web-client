import apiRequest from "@/lib/api";

export interface FetchProductsParams {
   categorySlug: string;
   page: number;
   searchParams?: Record<string, string | string[]>;
}

export interface FetchProductsResult {
   products: any[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
   };
}

interface ApiProductListResponse {
   data: any[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
   };
   message: string;
}

const KEY_MAP: Record<string, string> = {
   price_min: "minPrice",
   price_max: "maxPrice",
};

function mapKey(key: string): string {
   return KEY_MAP[key] ?? key;
}

export function buildQueryString(
   categorySlug: string,
   page: number,
   searchParams: Record<string, string | string[]> = {},
): string {
   const sp = new URLSearchParams();
   sp.set("category", categorySlug);
   sp.set("page", String(page));

   for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page") continue;
      if (value === undefined || value === null) continue;
      const apiKey = mapKey(key);
      if (Array.isArray(value)) {
         value.forEach((v) => sp.append(apiKey, v));
      } else {
         sp.set(apiKey, value);
      }
   }

   return sp.toString();
}

export async function fetchProducts({
   categorySlug,
   page,
   searchParams,
}: FetchProductsParams): Promise<FetchProductsResult> {
   const qs = buildQueryString(categorySlug, page, searchParams ?? {});

   const res = await apiRequest.get<ApiProductListResponse>(`/products?${qs}`, {
      noAuth: true,
   });

   return {
      products: res?.data ?? [],
      pagination: res?.pagination ?? {
         page: 1,
         limit: 12,
         total: 0,
         totalPages: 1,
      },
   };
}
