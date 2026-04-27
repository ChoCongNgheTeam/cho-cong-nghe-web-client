import apiRequest from "@/lib/api";
import type { ProductsResponse, ProductDetailResponse, GetProductsParams, ProductCard } from "../product.types";

export type ExportProductFormat = "excel" | "csv";

export interface ExportProductsParams {
  format: ExportProductFormat;
  brandId?: string | string[];
  categoryId?: string;
  isActive?: boolean;
  inStock?: boolean;
  search?: string;
}

export interface ImportResult {
  updated: number;
  skipped: number;
  errors: { row: number; variantId: string; reason: string }[];
}

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

export const toggleProductActive = async (id: string, isActive: boolean, isFeatured?: boolean): Promise<any> => {
  const fd = new FormData();
  const payload: Record<string, boolean> = { isActive };
  if (isFeatured !== undefined) payload.isFeatured = isFeatured;
  fd.append("data", JSON.stringify(payload));
  return apiRequest.patch<any>(`/products/admin/${id}`, fd);
};

export interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  viewsCount: number;
  priceOrigin: number;
  isTrending: boolean;
}

export interface SaleScheduleDay {
  date: string;
  isToday: boolean;
  hasActiveSale: boolean;
  promotions: Array<{
    id: string;
    name: string;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    priority: number;
    targetsCount: number;
    rules: Array<{
      actionType: string;
      discountValue: number | null;
    }>;
  }>;
}

export interface SaleByDateResponse {
  date: string;
  promotions: Array<{ id: string; name: string; description: string | null; priority: number }>;
  data: Array<{ card: ProductCard; pricingContext: any }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CompareSpecValue {
  key: string;
  name: string;
  icon?: string | null;
  unit?: string | null;
  values: (string | null)[];
}

export interface CompareSpecGroup {
  groupName: string;
  specs: CompareSpecValue[];
}

export interface CompareProductSummary {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  brand: { id: string; name: string; slug: string };
  price: number;
  inStock: boolean;
  rating: { average: number; count: number };
  totalSoldCount: number;
  isFeatured: boolean;
}

export interface CompareResponse {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  products: CompareProductSummary[];
  specMatrix: CompareSpecGroup[];
}

// export interface AdminProductStats {
//   total: number;
//   active: number;
//   inactive: number;
//   outOfStock: number;
//   deleted: number;
//   featured: number;
// }
export interface LowStockVariantInfo {
  id: string;
  code: string | null;
  quantity: number;
  price: number;
  label: string;
  isOutOfStock: boolean;
}

export interface LowStockProductInfo {
  id: string;
  name: string;
  slug: string;
  isFeatured: boolean;
  thumbnail: string | null;
  lowStockVariants: LowStockVariantInfo[];
  minQuantity: number;
}

export interface AdminProductStats {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number; // count sản phẩm hoàn toàn hết hàng
  deleted: number;
  featured: number;
  lowStock: number; // count sản phẩm SẮP hết (> 0 && <= 5), không bao gồm out
  lowStockProducts: LowStockProductInfo[]; // sắp hết
  outOfStockProducts: LowStockProductInfo[]; // hết hẳn
}
// SEARCH TRENDING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getSearchTrending
 *
 * q rỗng → top trending (focus vào ô search chưa gõ)
 * q có nội dung → filter + sort trending
 */
export const getSearchTrending = async (q: string = "", options: { limit?: number; category?: string } = {}): Promise<{ data: SearchSuggestion[]; total: number }> => {
  return apiRequest.get("/products/search-trending", {
    params: { q, ...options },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// SALE SCHEDULE V2
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getSaleScheduleV2
 *
 * Lấy lịch sale dạng calendar (chỉ metadata, không có products).
 * FE dùng để render calendar, khi click vào ngày mới gọi getProductsByDate.
 */
export const getSaleScheduleV2 = async (startDate?: string, endDate?: string): Promise<{ data: SaleScheduleDay[]; total: number }> => {
  return apiRequest.get("/products/sale-schedule-v2", {
    params: { startDate, endDate },
  });
};

/**
 * getProductsByDate
 *
 * Lấy products có sale vào ngày cụ thể.
 * Gọi khi FE click vào 1 ô ngày trên calendar.
 */
export const getProductsByDate = async (
  date: string,
  options: {
    promotionId?: string;
    page?: number;
    limit?: number;
    categoryId?: string;
  } = {},
): Promise<SaleByDateResponse> => {
  return apiRequest.get("/products/sale-by-date", {
    params: { date, ...options },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT COMPARISON
// ─────────────────────────────────────────────────────────────────────────────

/**
 * compareProducts
 *
 * So sánh 2-4 sản phẩm cùng category.
 * ids: mảng product IDs.
 */
export const compareProducts = async (ids: string[]): Promise<{ data: CompareResponse }> => {
  return apiRequest.get("/products/compare", {
    params: { ids: ids.join(",") },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN STATS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getAdminProductStats
 *
 * Dashboard overview: total, active, inactive, outOfStock, deleted, featured.
 */
export const getAdminProductStats = async (): Promise<{ data: AdminProductStats }> => {
  return apiRequest.get("/products/admin/stats");
};

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA UPLOAD (dùng cho CKEditor image adapter)
// ─────────────────────────────────────────────────────────────────────────────
export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export const getCategories = async (): Promise<{ data: CategoryOption[] }> => {
  return apiRequest.get("/categories", { params: { isActive: true, limit: 200 } });
};

// ─── Export ───────────────────────────────────────────────────────────────────

export async function exportProducts(params: ExportProductsParams): Promise<{ blob: Blob; filename: string; count: number }> {
  const qs = new URLSearchParams();
  qs.set("format", params.format);
  if (params.brandId) {
    const ids = Array.isArray(params.brandId) ? params.brandId : [params.brandId];
    ids.forEach((id) => qs.append("brandId", id));
  }
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  if (params.isActive !== undefined) qs.set("isActive", String(params.isActive));
  if (params.inStock !== undefined) qs.set("inStock", String(params.inStock));
  if (params.search) qs.set("search", params.search);

  const blob = await apiRequest.get<Blob>(`/products/admin/export?${qs.toString()}`, {
    responseType: "blob",
  });

  const ext = params.format === "excel" ? "xlsx" : "csv";
  return { blob, filename: `products_export_${Date.now()}.${ext}`, count: 0 };
}

// ─── Download import template ──────────────────────────────────────────────────

export async function downloadImportTemplate(): Promise<{ blob: Blob; filename: string }> {
  const blob = await apiRequest.get<Blob>("/products/admin/import/template", {
    responseType: "blob",
  });
  return { blob, filename: "product_import_template.xlsx" };
}

// ─── Import ───────────────────────────────────────────────────────────────────

export async function importProducts(file: File): Promise<{ data: ImportResult; message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest.post<{ data: ImportResult; message: string }>(
    "/products/admin/import",
    formData,
    // apiRequest tự detect FormData và không set Content-Type (browser tự thêm boundary)
  );
}
