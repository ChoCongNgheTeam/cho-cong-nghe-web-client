// ─── Tồn kho sản phẩm (overview) ───────────────────────────────────────────

export interface InventoryProductInfo {
  id: string;
  name: string;
  slug: string;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  img: { imageUrl: string | null }[];
}

export interface InventoryVariantAttribute {
  attributeOption: {
    value: string;
    label: string;
    attribute: { code: string; name: string };
  };
}

export interface InventoryWarehouseStock {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface InventoryOverviewRow {
  id: string; // = productVariantId
  code: string | null;
  price: number;
  isActive: boolean;
  product: InventoryProductInfo;
  variantAttributes: InventoryVariantAttribute[];
  totalQuantity: number;
  stocks: InventoryWarehouseStock[];
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface InventoryMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InventoryOverviewResponse {
  data: InventoryOverviewRow[];
  meta: InventoryMeta;
  message: string;
}

export type StockStatusFilter = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface GetInventoryParams {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string;
  categoryId?: string;
  brandId?: string;
  stockStatus?: StockStatusFilter;
}

export interface UpdateLowStockThresholdPayload {
  warehouseId?: string;
  lowStockThreshold: number;
}

// ─── Nhập kho / Xuất kho ────────────────────────────────────────────────────

export type StockMovementType = "STOCK_IN" | "STOCK_OUT" | "SALE" | "RETURN" | "ADJUSTMENT";

export type StockMovementReason =
  | "PURCHASE"
  | "DAMAGE"
  | "LOST"
  | "EXPIRED"
  | "RETURN_TO_SUPPLIER"
  | "CUSTOMER_RETURN"
  | "STOCKTAKE_ADJUSTMENT"
  | "ORDER_SALE"
  | "ORDER_CANCEL"
  | "INITIAL_STOCK"
  | "OTHER";

export interface StockInItemInput {
  productVariantId: string;
  quantity: number;
  unitCost?: number;
}

export interface StockInPayload {
  warehouseId?: string;
  supplierId?: string;
  reason?: StockMovementReason;
  note?: string;
  items: StockInItemInput[];
}

export interface StockOutItemInput {
  productVariantId: string;
  quantity: number;
}

export interface StockOutPayload {
  warehouseId?: string;
  reason?: StockMovementReason;
  note?: string;
  items: StockOutItemInput[];
}

// ─── Lịch sử nhập/xuất ──────────────────────────────────────────────────────

export interface StockMovement {
  id: string;
  code: string;
  type: StockMovementType;
  reason: StockMovementReason;
  quantity: number;
  unitCost: string | null;
  note: string | null;
  performedBy: string | null;
  createdAt: string;
  productVariant: {
    id: string;
    code: string | null;
    product: { id: string; name: string; slug: string };
  };
  warehouse: { id: string; name: string; code: string };
  supplier: { id: string; name: string; code: string } | null;
  order: { id: string; orderCode: string } | null;
  stocktake: { id: string; code: string } | null;
}

export interface StockMovementsResponse {
  data: StockMovement[];
  meta: InventoryMeta;
  message: string;
}

export interface GetMovementsParams {
  page?: number;
  limit?: number;
  type?: StockMovementType;
  reason?: StockMovementReason;
  warehouseId?: string;
  productVariantId?: string;
  supplierId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Cảnh báo tồn kho thấp ──────────────────────────────────────────────────

export interface LowStockAlert {
  variantId: string;
  variantCode: string | null;
  productName: string;
  productSlug: string;
  thumbnail: string | null;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  lowStockThreshold: number;
  isOutOfStock: boolean;
}

export interface LowStockAlertsMeta extends InventoryMeta {
  outOfStockCount: number;
  lowStockCount: number;
}

export interface LowStockAlertsResponse {
  data: LowStockAlert[];
  meta: LowStockAlertsMeta;
  message: string;
}

export interface GetAlertsParams {
  page?: number;
  limit?: number;
  warehouseId?: string;
}

// ─── Kiểm kê kho (Stocktake) ────────────────────────────────────────────────

export type StocktakeStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface StocktakeItem {
  id: string;
  productVariantId: string;
  systemQuantity: number;
  actualQuantity: number | null;
  difference: number | null;
  note: string | null;
  productVariant: {
    id: string;
    code: string | null;
    product: { id: string; name: string; slug: string };
  };
}

export interface Stocktake {
  id: string;
  code: string;
  status: StocktakeStatus;
  note: string | null;
  createdBy: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  warehouse: { id: string; name: string; code: string };
  items: StocktakeItem[];
}

export type StocktakesMeta = InventoryMeta;

export interface StocktakesResponse {
  data: Stocktake[];
  meta: StocktakesMeta;
  message: string;
}

export interface GetStocktakesParams {
  page?: number;
  limit?: number;
  status?: StocktakeStatus;
  warehouseId?: string;
}

export interface CreateStocktakePayload {
  warehouseId?: string;
  note?: string;
  productVariantIds?: string[];
}

export interface UpdateStocktakeItemsPayload {
  items: { productVariantId: string; actualQuantity: number; note?: string }[];
}
