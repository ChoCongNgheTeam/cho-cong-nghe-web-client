import apiRequest from "@/lib/api";
import {
  InventoryOverviewResponse,
  GetInventoryParams,
  InventoryOverviewRow,
  UpdateLowStockThresholdPayload,
  StockInPayload,
  StockOutPayload,
  StockMovementsResponse,
  GetMovementsParams,
  LowStockAlertsResponse,
  GetAlertsParams,
  InventoryProductInfo,
  InventoryVariantAttribute,
} from "../inventory.types";
import type { ResourceEnvelope } from "@/lib/admin/createResourceApi";
import type { EntityOption } from "@/components/admin/shared/EntitySelect";

// LƯU Ý: module inventory không phải CRUD 1 resource đơn (có nhiều sub-action:
// stock-in, stock-out, movements, alerts...) nên không dùng createResourceApi —
// viết tay toàn bộ, path khớp 1-1 với route BE đã build.

// ─── Tồn kho sản phẩm ───────────────────────────────────────────────────────

export const getInventoryOverview = (params?: GetInventoryParams): Promise<InventoryOverviewResponse> => apiRequest.get<InventoryOverviewResponse>("/admin/inventory", { params });

export interface InventoryVariantDetail {
  id: string;
  code: string | null;
  price: number;
  quantity: number;
  isActive: boolean;
  product: InventoryProductInfo;
  variantAttributes: InventoryVariantAttribute[];
  warehouseStocks: { id: string; warehouseId: string; quantity: number; lowStockThreshold: number | null; warehouse: { id: string; name: string; code: string } }[];
}

export const getVariantInventoryDetail = (variantId: string): Promise<{ data: InventoryVariantDetail; message: string }> => apiRequest.get(`/admin/inventory/${variantId}`);

/** Dùng để prefill 1 dòng sản phẩm trong form nhập/xuất kho khi đến từ link ?variantId= */
export const getVariantAsSearchOption = async (variantId: string): Promise<EntityOption | null> => {
  try {
    const res = await getVariantInventoryDetail(variantId);
    const v = res.data;
    const attrText = v.variantAttributes.map((a) => a.attributeOption.label).join(" / ");
    return {
      id: v.id,
      name: attrText ? `${v.product.name} — ${attrText}` : v.product.name,
      meta: v.code ?? undefined,
      thumbnail: v.product.img[0]?.imageUrl ?? undefined,
      price: v.price,
    };
  } catch {
    return null;
  }
};

export const updateLowStockThreshold = (variantId: string, payload: UpdateLowStockThresholdPayload): Promise<{ data: unknown; message: string }> =>
  apiRequest.patch(`/admin/inventory/${variantId}/threshold`, payload);

// ─── Tìm variant (dùng cho SingleProductSearch ở nhập/xuất/kiểm kê kho) ─────

/** Map 1 dòng InventoryOverviewRow -> option hiển thị trong ô tìm sản phẩm (SingleProductSearch) */
export function inventoryRowToSearchOption(row: InventoryOverviewRow): EntityOption {
  const attrText = row.variantAttributes.map((a) => a.attributeOption.label).join(" / ");
  return {
    id: row.id,
    name: attrText ? `${row.product.name} — ${attrText}` : row.product.name,
    meta: [row.code, `Tồn: ${row.totalQuantity}`].filter(Boolean).join(" · "),
    thumbnail: row.product.img[0]?.imageUrl ?? undefined,
    price: row.price,
  };
}

export const searchVariantsForPicker = async (term: string): Promise<EntityOption[]> => {
  if (!term.trim()) return [];
  const res = await getInventoryOverview({ search: term, limit: 20 });
  return res.data.map(inventoryRowToSearchOption);
};

// ─── Nhập kho / Xuất kho ─────────────────────────────────────────────────────

export const stockIn = (payload: StockInPayload): Promise<{ data: unknown; message: string }> => apiRequest.post("/admin/inventory/stock-in", payload);

export const stockOut = (payload: StockOutPayload): Promise<{ data: unknown; message: string }> => apiRequest.post("/admin/inventory/stock-out", payload);

// ─── Lịch sử nhập/xuất ────────────────────────────────────────────────────────

export const getMovementHistory = (params?: GetMovementsParams): Promise<StockMovementsResponse> => apiRequest.get<StockMovementsResponse>("/admin/inventory/movements", { params });

// ─── Cảnh báo tồn kho thấp ────────────────────────────────────────────────────

export const getLowStockAlerts = (params?: GetAlertsParams): Promise<LowStockAlertsResponse> => apiRequest.get<LowStockAlertsResponse>("/admin/inventory/alerts", { params });

// ─── Khởi tạo tồn kho ban đầu (chạy 1 lần khi mới tạo kho) ───────────────────

export const initializeWarehouseStock = (warehouseId?: string): Promise<ResourceEnvelope<{ warehouseId: string; initializedCount: number }>> =>
  apiRequest.post("/admin/inventory/initialize", { warehouseId });
