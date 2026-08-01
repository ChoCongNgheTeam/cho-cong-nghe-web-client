export type ShipmentStatus = "PENDING" | "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED" | "RETURNED" | "CANCELLED";

export type ShippingProviderCode = "GHN" | "GHTK" | "VTP";

export interface ShipmentProvider {
  id: string;
  code: ShippingProviderCode;
  name: string;
}

export interface ShipmentOrderItem {
  quantity: number;
  unitPrice: string;
  productVariant: {
    code: string | null;
    product: { name: string };
  };
}

export interface ShipmentOrder {
  id: string;
  orderCode: string;
  shippingContactName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingWard: string;
  shippingDetail: string;
  orderStatus: string;
  totalAmount: string;
  paymentStatus: string;
  orderItems: ShipmentOrderItem[];
}

export interface Shipment {
  id: string;
  orderId: string;
  providerId: string;
  providerOrderCode: string | null;
  status: ShipmentStatus;
  shippingFee: string | null;
  expectedDeliveryAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  failedReason: string | null;
  createdAt: string;
  updatedAt: string;
  provider: ShipmentProvider;
  order: ShipmentOrder;
}

export interface ShipmentsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

export interface ShipmentsResponse {
  data: Shipment[];
  meta: ShipmentsMeta;
  message: string;
}

export interface GetShipmentsParams {
  page?: number;
  limit?: number;
  status?: ShipmentStatus;
  providerCode?: ShippingProviderCode;
  search?: string;
  sortBy?: "createdAt" | "expectedDeliveryAt";
  sortOrder?: "asc" | "desc";
}

// Đơn hàng CHƯA có vận đơn — dùng cho picker chọn đơn khi tạo hàng loạt
export interface EligibleOrder {
  id: string;
  orderCode: string;
  shippingContactName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingWard: string;
  totalAmount: string;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  _count: { orderItems: number };
}

export interface EligibleOrdersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EligibleOrdersResponse {
  data: EligibleOrder[];
  meta: EligibleOrdersMeta;
  message: string;
}

export interface GetEligibleOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  orderStatus?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
}

export interface ShippingProvider {
  id: string;
  code: ShippingProviderCode;
  name: string;
  isActive: boolean;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingProvidersResponse {
  data: ShippingProvider[];
  message: string;
}

export interface CreateShipmentPayload {
  orderId: string;
  providerCode: ShippingProviderCode;
  weightGram: number;
  note?: string;
}

export interface BulkCreateShipmentPayload {
  orderIds: string[];
  providerCode: ShippingProviderCode;
  weightGram: number;
}

export interface BulkCreateShipmentResultItem {
  orderId: string;
  success: boolean;
  shipmentId?: string;
  providerOrderCode?: string;
  error?: string;
}

export interface BulkCreateShipmentResponse {
  data: BulkCreateShipmentResultItem[];
  message: string;
}

export interface UpsertShippingProviderPayload {
  code: ShippingProviderCode;
  name: string;
  isActive: boolean;
  config: Record<string, unknown>;
}
