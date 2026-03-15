import apiRequest from "@/lib/api";
import type { ProductsResponse, ProductDetailResponse, GetProductsParams } from "../product.types";

// ─────────────────────────────────────────────────────────────────────────────
// LIST
// ─────────────────────────────────────────────────────────────────────────────

export const getAllProducts = async (params?: GetProductsParams): Promise<ProductsResponse> => {
  return apiRequest.get<ProductsResponse>("/products/admin/all", { params });
};

export const getDeletedProducts = async (params?: { page?: number; limit?: number; search?: string }): Promise<ProductsResponse> => {
  return apiRequest.get<ProductsResponse>("/products/admin/trash", { params });
};

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL
// ─────────────────────────────────────────────────────────────────────────────

export const getProduct = async (id: string): Promise<ProductDetailResponse> => {
  return apiRequest.get<ProductDetailResponse>(`/products/admin/${id}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / UPDATE (multipart/form-data)
// ─────────────────────────────────────────────────────────────────────────────

export const createProduct = async (formData: FormData): Promise<ProductDetailResponse> => {
  return apiRequest.post<ProductDetailResponse>("/products/admin", formData);
};

export const updateProduct = async (id: string, formData: FormData): Promise<ProductDetailResponse> => {
  return apiRequest.patch<ProductDetailResponse>(`/products/admin/${id}`, formData);
};

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE / RESTORE / HARD DELETE
// ─────────────────────────────────────────────────────────────────────────────

export const softDeleteProduct = async (id: string): Promise<{ message: string }> => {
  return apiRequest.delete<{ message: string }>(`/products/admin/${id}`);
};

export const restoreProduct = async (id: string): Promise<ProductDetailResponse> => {
  return apiRequest.post<ProductDetailResponse>(`/products/admin/${id}/restore`);
};

export const hardDeleteProduct = async (id: string): Promise<{ message: string }> => {
  return apiRequest.delete<{ message: string }>(`/products/admin/${id}/permanent`);
};

// ─────────────────────────────────────────────────────────────────────────────
// BULK
// ─────────────────────────────────────────────────────────────────────────────

export type BulkAction = "delete" | "activate" | "deactivate" | "feature" | "unfeature";

export const bulkAction = async (action: BulkAction, ids: string[]): Promise<{ count: number; message: string }> => {
  return apiRequest.post<{ count: number; message: string }>("/products/admin/bulk", {
    action,
    ids,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE ACTIVE (quick update)
// ─────────────────────────────────────────────────────────────────────────────

export const toggleProductActive = async (id: string, isActive: boolean): Promise<ProductDetailResponse> => {
  const fd = new FormData();
  fd.append("data", JSON.stringify({ isActive }));
  return apiRequest.patch<ProductDetailResponse>(`/products/admin/${id}`, fd);
};
