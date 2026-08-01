import apiRequest from "@/lib/api";
import type {
  ShipmentsResponse,
  GetShipmentsParams,
  Shipment,
  EligibleOrdersResponse,
  GetEligibleOrdersParams,
  CreateShipmentPayload,
  BulkCreateShipmentPayload,
  BulkCreateShipmentResponse,
} from "../shipment.types";

// LƯU Ý: module shipping mount ở "/shipping" (không phải "/admin/..." như hầu
// hết module khác) — vì router có thêm route webhook public "/shipping/webhook/:code"
// nằm ngoài phần "/admin". Xem shipping.route.ts bên BE.

export const getAllShipments = (params?: GetShipmentsParams): Promise<ShipmentsResponse> => apiRequest.get<ShipmentsResponse>("/shipping/admin/shipments/all", { params });

export const getShipment = (id: string): Promise<{ data: Shipment; message: string }> => apiRequest.get(`/shipping/admin/shipments/${id}`);

/** Trả về null nếu đơn hàng chưa có vận đơn (404) — không throw để component gọi gọn hơn. */
export async function getShipmentByOrder(orderId: string): Promise<Shipment | null> {
  try {
    const res = await apiRequest.get<{ data: Shipment; message: string }>(`/shipping/admin/shipments/by-order/${orderId}`);
    return res.data;
  } catch {
    return null;
  }
}

export const createShipment = (payload: CreateShipmentPayload): Promise<{ data: Shipment; message: string }> => apiRequest.post("/shipping/admin/shipments", payload);

export const createBulkShipments = (payload: BulkCreateShipmentPayload): Promise<BulkCreateShipmentResponse> => apiRequest.post("/shipping/admin/shipments/bulk", payload);

export const cancelShipment = (id: string): Promise<{ data: Shipment; message: string }> => apiRequest.post(`/shipping/admin/shipments/${id}/cancel`);

export const getEligibleOrders = (params?: GetEligibleOrdersParams): Promise<EligibleOrdersResponse> => apiRequest.get<EligibleOrdersResponse>("/shipping/admin/shipments/eligible-orders", { params });

/**
 * In tem hàng loạt — GET + query (không phải POST + body) vì apiRequest chỉ hỗ
 * trợ responseType: "blob" ở method get() (giống hệt pattern exportOrders bên
 * module orders). shipmentIds nối bằng dấu phẩy trong query string.
 */
export async function printBulkLabels(shipmentIds: string[]): Promise<{ blob: Blob; filename: string }> {
  const blob = await apiRequest.get<Blob>("/shipping/admin/shipments/bulk-print", {
    params: { shipmentIds: shipmentIds.join(",") },
    responseType: "blob",
  });
  return { blob, filename: `van-don-${Date.now()}.pdf` };
}
