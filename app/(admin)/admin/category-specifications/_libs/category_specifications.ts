import apiRequest from "@/lib/api";
import type { GetCategorySpecsResponse, UpsertCategorySpecPayload, BulkUpsertCategorySpecsPayload, CategorySpecItem } from "../category_specification.types";

interface MutateCategorySpecResponse {
  data: CategorySpecItem;
  message: string;
}

interface BulkMutateCategorySpecResponse {
  data: CategorySpecItem[];
  message: string;
}

interface RemoveResponse {
  message: string;
}

// ── Categories (for selector) ─────────────────────────────────────────────
export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
}

export interface CategoriesResponse {
  data: CategoryOption[];
  message: string;
}

export const getActiveCategories = async (): Promise<CategoriesResponse> => {
  return apiRequest.get<CategoriesResponse>("/categories");
};

// ── Category Specifications ───────────────────────────────────────────────
export const getCategorySpecs = async (categoryId: string): Promise<GetCategorySpecsResponse> => {
  return apiRequest.get<GetCategorySpecsResponse>(`/specifications/admin/category-specs/${categoryId}`);
};

export const upsertCategorySpec = async (categoryId: string, payload: UpsertCategorySpecPayload): Promise<MutateCategorySpecResponse> => {
  return apiRequest.post<MutateCategorySpecResponse>(`/specifications/admin/category-specs/${categoryId}/upsert`, payload);
};

export const bulkUpsertCategorySpecs = async (categoryId: string, payload: BulkUpsertCategorySpecsPayload): Promise<BulkMutateCategorySpecResponse> => {
  return apiRequest.put<BulkMutateCategorySpecResponse>(`/specifications/admin/category-specs/${categoryId}/bulk`, payload);
};

export const removeCategorySpec = async (categoryId: string, specificationId: string): Promise<RemoveResponse> => {
  return apiRequest.delete<RemoveResponse>(`/specifications/admin/category-specs/${categoryId}/${specificationId}`);
};
