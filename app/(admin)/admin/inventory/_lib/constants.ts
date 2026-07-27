import type { StockMovementType, StockMovementReason, StocktakeStatus, StockStatusFilter } from "../inventory.types";

export const STOCK_STATUS_TABS: { value: StockStatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "IN_STOCK", label: "Còn hàng" },
  { value: "LOW_STOCK", label: "Sắp hết" },
  { value: "OUT_OF_STOCK", label: "Hết hàng" },
];

export const MOVEMENT_TYPE_LABEL: Record<StockMovementType, { label: string; color: string }> = {
  STOCK_IN: { label: "Nhập kho", color: "text-emerald-600 bg-emerald-50" },
  STOCK_OUT: { label: "Xuất kho", color: "text-orange-500 bg-orange-50" },
  SALE: { label: "Bán hàng", color: "text-blue-600 bg-blue-50" },
  RETURN: { label: "Hoàn hàng", color: "text-purple-600 bg-purple-50" },
  ADJUSTMENT: { label: "Điều chỉnh", color: "text-neutral-dark bg-neutral-light-active" },
};

export const MOVEMENT_TYPE_TABS: { value: StockMovementType; label: string }[] = [
  { value: "STOCK_IN", label: "Nhập kho" },
  { value: "STOCK_OUT", label: "Xuất kho" },
  { value: "SALE", label: "Bán hàng" },
  { value: "RETURN", label: "Hoàn hàng" },
  { value: "ADJUSTMENT", label: "Điều chỉnh" },
];

export const REASON_LABEL: Record<StockMovementReason, string> = {
  PURCHASE: "Nhập mua hàng",
  DAMAGE: "Hàng hỏng",
  LOST: "Thất lạc",
  EXPIRED: "Hết hạn sử dụng",
  RETURN_TO_SUPPLIER: "Trả lại nhà cung cấp",
  CUSTOMER_RETURN: "Khách trả hàng",
  STOCKTAKE_ADJUSTMENT: "Điều chỉnh theo kiểm kê",
  ORDER_SALE: "Bán hàng (đơn hàng)",
  ORDER_CANCEL: "Hủy đơn hàng",
  INITIAL_STOCK: "Khởi tạo tồn kho ban đầu",
  OTHER: "Khác",
};

// Lý do hợp lý khi NHẬP kho thủ công qua UI
export const STOCK_IN_REASON_OPTIONS: { value: StockMovementReason; label: string }[] = [
  { value: "PURCHASE", label: REASON_LABEL.PURCHASE },
  { value: "CUSTOMER_RETURN", label: REASON_LABEL.CUSTOMER_RETURN },
  { value: "INITIAL_STOCK", label: REASON_LABEL.INITIAL_STOCK },
  { value: "OTHER", label: REASON_LABEL.OTHER },
];

// Lý do hợp lý khi XUẤT kho thủ công qua UI
export const STOCK_OUT_REASON_OPTIONS: { value: StockMovementReason; label: string }[] = [
  { value: "DAMAGE", label: REASON_LABEL.DAMAGE },
  { value: "LOST", label: REASON_LABEL.LOST },
  { value: "EXPIRED", label: REASON_LABEL.EXPIRED },
  { value: "RETURN_TO_SUPPLIER", label: REASON_LABEL.RETURN_TO_SUPPLIER },
  { value: "OTHER", label: REASON_LABEL.OTHER },
];

export const STOCKTAKE_STATUS_LABEL: Record<StocktakeStatus, { label: string; color: string }> = {
  DRAFT: { label: "Nháp", color: "text-neutral-dark bg-neutral-light-active" },
  IN_PROGRESS: { label: "Đang kiểm kê", color: "text-blue-600 bg-blue-50" },
  COMPLETED: { label: "Đã hoàn tất", color: "text-emerald-600 bg-emerald-50" },
  CANCELLED: { label: "Đã hủy", color: "text-promotion bg-promotion-light" },
};
