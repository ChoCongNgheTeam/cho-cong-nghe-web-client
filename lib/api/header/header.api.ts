import apiRequest from "@/lib/api";
import { slugify } from "./utils";
import { CategoryResponse, RootCategoryResponse, SearchResponse, TrendingResponse } from "./type";
import { Category } from "@/types/category";
import { SearchProduct, TrendingKeyword } from "../../../components/layout/header/type";

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await apiRequest.get<CategoryResponse>("/categories/tree", { noAuth: true, next: { revalidate: 3600 } });
  return res?.data ?? [];
};

export const fetchRootCategories = async (): Promise<Category[]> => {
  const res = await apiRequest.get<RootCategoryResponse>("/categories/roots", { noAuth: true, next: { revalidate: 3600 } });
  return res?.data ?? [];
};

export const fetchCategoryChildren = async (categoryId: string): Promise<Category[]> => {
  const res = await apiRequest.get<{ data: Category[] }>(`/categories/${categoryId}/children`, { noAuth: true, next: { revalidate: 3600 } });
  return res?.data ?? [];
};

export const fetchTrendingKeywords = async (): Promise<TrendingKeyword[]> => {
  const res = await apiRequest.get<TrendingResponse>("/products/search-trending", { noAuth: true });
  return res?.data ?? [];
};

export const resolveSearchCategory = async (term: string): Promise<string | null> => {
  const res = await apiRequest.get<{ data: { slug: string } | null }>("/categories/resolve", { params: { q: slugify(term) }, noAuth: true });
  return res?.data?.slug ?? null;
};

export const fetchSearchResults = async (q: string, signal: AbortSignal): Promise<SearchProduct[]> => {
  const res = await apiRequest.get<SearchResponse>("/search", {
    params: { q, limit: 8 },
    noAuth: true,
    signal,
  });
  return res?.data ?? [];
};
