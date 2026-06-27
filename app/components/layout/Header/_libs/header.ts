import apiRequest from "@/lib/api";
import { slugify } from "./utils";
import { Category, SearchProduct, TrendingKeyword } from "../types";

interface CategoryResponse {
  data: Category[];
  message: string;
}

interface TrendingResponse {
  data: TrendingKeyword[];
  total: number;
  message: string;
}

interface SearchResponse {
  data: SearchProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

interface RootCategoryResponse {
  data: Category[];
  message: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await apiRequest.get<CategoryResponse>("/categories/tree", { noAuth: true });
  return res.data;
};

export const fetchRootCategories = async (): Promise<Category[]> => {
  const res = await apiRequest.get<RootCategoryResponse>("/categories/roots", { noAuth: true });
  return res.data ?? [];
};

export const fetchCategoryChildren = async (categoryId: string): Promise<Category[]> => {
  try {
    const res = await apiRequest.get<{ data: Category[] }>(`/categories/${categoryId}/children`, { noAuth: true });
    return res.data ?? [];
  } catch {
    return [];
  }
};

export const fetchTrendingKeywords = async (): Promise<TrendingKeyword[]> => {
  try {
    const res = await apiRequest.get<TrendingResponse>("/products/search-trending", { noAuth: true });
    return res?.data ?? [];
  } catch {
    return [];
  }
};

export const resolveSearchCategory = async (term: string): Promise<string | null> => {
  try {
    const res = await apiRequest.get<{ data: { slug: string } | null }>("/categories/resolve", { params: { q: slugify(term) }, noAuth: true });
    return res?.data?.slug ?? null;
  } catch {
    return null;
  }
};

export const fetchSearchResults = async (q: string, signal: AbortSignal): Promise<SearchProduct[]> => {
  const res = await apiRequest.get<SearchResponse>("/search", {
    params: { q, limit: 8 },
    noAuth: true,
    signal,
  });
  return res?.data ?? [];
};
