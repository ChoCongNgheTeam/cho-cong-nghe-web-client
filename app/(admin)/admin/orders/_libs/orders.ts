import apiRequest from "@/lib/api";
import { OrdersResponse, Order } from "../order.types";

export interface CancelOrderResponse {
  message: string;
}

export interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  orderStatus?: string;
  paymentStatus?: string;
  search?: string;
}

export interface OrderDetailResponse {
  data: Order;
  message: string;
}

export interface CreateOrderAdminPayload {
  userId?: string;
  shippingAddressId?: string;
  customerInfo?: {
    fullName: string;
    phone: string;
    email?: string;
  };
  newAddress?: {
    provinceId: string;
    wardId: string;
    detailAddress: string;
  };
  items: {
    productVariantId: string;
    quantity: number;
    unitPrice: number;
  }[];
  voucherCode?: string;
  shippingFee: number;
  paymentMethodId: string;
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  orderStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

export async function getAllOrders(params?: GetAllOrdersParams): Promise<OrdersResponse> {
  return apiRequest.get<OrdersResponse>("/orders/admin/all", { params });
}

export async function getOrderById(id: string): Promise<OrderDetailResponse> {
  return apiRequest.get<OrderDetailResponse>(`/orders/admin/${id}`);
}

export async function cancelOrder(id: string): Promise<CancelOrderResponse> {
  return apiRequest.post<CancelOrderResponse>(`/orders/admin/${id}/cancel`);
}

export async function updateOrderStatus(id: string, orderStatus: string): Promise<OrderDetailResponse> {
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, { orderStatus });
}

export async function updatePaymentStatus(id: string, paymentStatus: "UNPAID" | "PAID" | "REFUNDED"): Promise<OrderDetailResponse> {
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, { paymentStatus });
}

export async function createOrderAdmin(payload: CreateOrderAdminPayload): Promise<OrderDetailResponse> {
  return apiRequest.post<OrderDetailResponse>("/orders/admin", payload);
}
