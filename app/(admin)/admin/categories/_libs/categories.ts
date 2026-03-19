import apiRequest from "@/lib/api";
import type { CategoriesAdminResponse, CategoriesResponse, GetCategoriesParams, Category } from "../category.types";

// ─────────────────────────────────────────────────────────────────────────────
// LIST (admin paginated)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /categories/admin — paginated với meta + statusCounts */
export const getCategoriesAdmin = async (params?: GetCategoriesParams): Promise<CategoriesAdminResponse> => apiRequest.get<CategoriesAdminResponse>("/categories/admin", { params });

/** GET /categories/admin/all — flat list không phân trang (dùng cho dropdown) */
export const getAllCategories = async (): Promise<CategoriesResponse> => apiRequest.get<CategoriesResponse>("/categories/admin/all");

/** GET /categories/admin/trash — danh mục đã xóa */
export const getDeletedCategories = async (params?: { page?: number; limit?: number }): Promise<CategoriesResponse> => apiRequest.get<CategoriesResponse>("/categories/admin/trash", { params });

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL
// ─────────────────────────────────────────────────────────────────────────────

export const getCategoryDetail = async (id: string): Promise<{ data: Category; message: string }> => apiRequest.get<{ data: Category; message: string }>(`/categories/admin/${id}`);

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / UPDATE (multipart/form-data)
// ─────────────────────────────────────────────────────────────────────────────

export const createCategory = async (formData: FormData): Promise<{ data: Category; message: string }> => apiRequest.post<{ data: Category; message: string }>("/categories/admin", formData);

export const updateCategory = async (id: string, formData: FormData): Promise<{ data: Category; message: string }> =>
  apiRequest.patch<{ data: Category; message: string }>(`/categories/admin/${id}`, formData);

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE / RESTORE / HARD DELETE
// ─────────────────────────────────────────────────────────────────────────────

export const softDeleteCategory = async (id: string): Promise<{ message: string }> => apiRequest.delete<{ message: string }>(`/categories/admin/${id}`);

export const restoreCategory = async (id: string): Promise<{ data: Category; message: string }> => apiRequest.post<{ data: Category; message: string }>(`/categories/admin/${id}/restore`);

export const hardDeleteCategory = async (id: string): Promise<{ message: string }> => apiRequest.delete<{ message: string }>(`/categories/admin/${id}/permanent`);

// ─────────────────────────────────────────────────────────────────────────────
// REORDER
// ─────────────────────────────────────────────────────────────────────────────

export const reorderCategory = async (categoryId: string, newPosition: number): Promise<{ message: string }> =>
  apiRequest.post<{ message: string }>("/categories/admin/reorder", { categoryId, newPosition });
