import type { ShipmentStatus, ShippingProviderCode } from "../shipment.types";

export const SHIPMENT_STATUS_CONFIG: Record<
  ShipmentStatus,
  { label: string; dot: string; pill: string }
> = {
  PENDING: { label: "Chờ tạo", dot: "bg-neutral-dark", pill: "bg-neutral-light-active border-neutral text-neutral-darker" },
  CREATED: { label: "Đã tạo đơn", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-600 border border-amber-200" },
  PICKED_UP: { label: "Đã lấy hàng", dot: "bg-blue-500", pill: "bg-blue-50 text-blue-600 border border-blue-200" },
  IN_TRANSIT: { label: "Đang vận chuyển", dot: "bg-indigo-500", pill: "bg-indigo-50 text-indigo-600 border border-indigo-200" },
  DELIVERED: { label: "Đã giao", dot: "bg-emerald-400", pill: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  FAILED: { label: "Giao thất bại", dot: "bg-red-500", pill: "bg-red-50 text-red-600 border border-red-200" },
  RETURNED: { label: "Hoàn trả", dot: "bg-orange-500", pill: "bg-orange-50 text-orange-600 border border-orange-200" },
  CANCELLED: { label: "Đã huỷ", dot: "bg-neutral-dark", pill: "bg-neutral-light-active border-neutral text-neutral-darker" },
};

export const STATUS_TABS: { label: string; value: "ALL" | ShipmentStatus }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ tạo", value: "PENDING" },
  { label: "Đã tạo đơn", value: "CREATED" },
  { label: "Đã lấy hàng", value: "PICKED_UP" },
  { label: "Đang vận chuyển", value: "IN_TRANSIT" },
  { label: "Đã giao", value: "DELIVERED" },
  { label: "Giao thất bại", value: "FAILED" },
  { label: "Hoàn trả", value: "RETURNED" },
  { label: "Đã huỷ", value: "CANCELLED" },
];

export const SORT_OPTIONS = [
  { value: "createdAt", label: "Ngày tạo vận đơn" },
  { value: "expectedDeliveryAt", label: "Ngày dự kiến giao" },
];

export const PROVIDER_OPTIONS: { value: ShippingProviderCode; label: string }[] = [
  { value: "GHN", label: "Giao Hàng Nhanh (GHN)" },
  { value: "GHTK", label: "Giao Hàng Tiết Kiệm (GHTK)" },
  { value: "VTP", label: "Viettel Post (VTP)" },
];

/** GHTK/VTP mới có khung adapter, chưa nối API thật — disable trong picker để tránh admin chọn nhầm rồi tạo lỗi. */
export const ENABLED_PROVIDERS: ShippingProviderCode[] = ["GHN"];

// Chỉ các trạng thái đơn hàng này mới hợp lý để tạo vận đơn (đơn PENDING nhìn
// chung chưa xác nhận xong, DELIVERED/CANCELLED không cần/không nên tạo nữa).
export const ORDER_STATUS_OPTIONS_FOR_PICKER: { value: string; label: string }[] = [
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "SHIPPED", label: "Đang giao" },
];
