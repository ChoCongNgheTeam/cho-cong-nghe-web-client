import apiRequest from "@/lib/api";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl?: string;
  imagePath?: string;
  position?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  description?: string;
  children?: Category[];
}

interface CategoryResponse {
  data: Category;
  message: string;
}

export async function fetchCategory(slug: string): Promise<Category | null> {
  try {
    const res = await apiRequest.get<CategoryResponse>(`/categories/slug/${slug}`, { noAuth: true });

    return res?.data ?? null;
  } catch (err) {
    console.error("[fetchCategory] failed:", err);
    return null;
  }
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

type FilterGroupBase = {
  key: string;
  name: string;
  source: "specification" | "attribute" | "built-in";
  sortOrder?: number;
};

export type FilterGroup =
  | (FilterGroupBase & {
      type: "RANGE";
      range: { min: number; max: number; unit?: string };
      options?: never;
    })
  | (FilterGroupBase & {
      type: "ENUM";
      options: FilterOption[];
      range?: never;
    })
  | (FilterGroupBase & {
      type: "BOOLEAN";
      options: FilterOption[];
      range?: never;
    });

interface FilterResponse {
  data: {
    categoryId: string;
    categorySlug: string;
    categoryName: string;
    filters: FilterGroup[];
  };
  message: string;
}

export async function fetchFilters(categorySlug: string): Promise<FilterGroup[]> {
  try {
    const res = await apiRequest.get<FilterResponse>("/products/filters", {
      params: { category: categorySlug },
      noAuth: true,
    });

    return res?.data?.filters ?? [];
  } catch (err) {
    console.error("[fetchFilters] failed:", err);
    return [];
  }
}

export interface FetchProductsParams {
  categorySlug: string;
  page: number;
  searchParams?: Record<string, string | string[]>;
}

export interface FetchProductsResult {
  products: any[];
  pagination: Pagination;
}

interface ApiProductListResponse {
  data: any[];
  pagination: Pagination;
  message: string;
}

/* Map FE → BE query keys */
const KEY_MAP: Record<string, string> = {
  price_min: "minPrice",
  price_max: "maxPrice",
};

function mapKey(key: string): string {
  return KEY_MAP[key] ?? key;
}

/* Build query string */
export function buildQueryString(categorySlug: string, page: number, searchParams: Record<string, string | string[]> = {}): string {
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

/* Fetch products */
export async function fetchProducts({ categorySlug, page, searchParams }: FetchProductsParams): Promise<FetchProductsResult> {
  try {
    const qs = buildQueryString(categorySlug, page, searchParams ?? {});

    const res = await apiRequest.get<ApiProductListResponse>(`/products?${qs}`, { noAuth: true });

    return {
      products: res?.data ?? [],
      pagination: res?.pagination ?? {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1,
      },
    };
  } catch (err) {
    console.error("[fetchProducts] failed:", err);

    return {
      products: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1,
      },
    };
  }
}
