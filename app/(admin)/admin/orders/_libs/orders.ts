import apiRequest from "@/lib/api";
import type { Order, OrderStatus, PaymentStatus } from "../order.types";

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface Province {
  code: string;
  name: string;
  fullName: string;
}

export interface Ward {
  code: string;
  name: string;
  fullName: string;
}

export interface UserAddress {
  id: string;
  contactName: string;
  phone: string;
  detailAddress: string;
  fullAddress?: string;
  province: { code: string; name: string; fullName?: string };
  ward: { code: string; name: string; fullName?: string };
  isDefault: boolean;
  type?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  variantCode?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image?: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  shippingAddress?: UserAddress;
}

export interface CreateOrderAdminPayload {
  userId: string;
  shippingAddressId?: string;
  newAddress?: {
    contactName: string;
    phone: string;
    provinceCode: string;
    wardCode: string;
    detailAddress: string;
    type?: string;
  };
  paymentMethodId: string;
  voucherId?: string;
  cartItemIds: string[];
  note?: string;
}

export interface UpdateOrderPayload {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  note?: string;
}

// ─── NEW: PaymentMethod type ──────────────────────────────────────────────────
export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const getOrders = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
}): Promise<{ data: Order[]; total: number; page: number; limit: number }> => {
  const res = await apiRequest.get<{
    data: Order[];
    total: number;
    page: number;
    limit: number;
  }>("/admin/orders", { params });
  return res;
};

export const getOrderById = async (id: string): Promise<OrderDetail> => {
  const res = await apiRequest.get<{ data: OrderDetail }>(`/admin/orders/${id}`);
  return res.data;
};

export const createOrder = async (
  payload: CreateOrderAdminPayload
): Promise<Order> => {
  const res = await apiRequest.post<{ data: Order }>("/admin/orders", payload);
  return res.data;
};

export const updateOrder = async (
  id: string,
  payload: UpdateOrderPayload
): Promise<Order> => {
  const res = await apiRequest.put<{ data: Order }>(`/admin/orders/${id}`, payload);
  return res.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await apiRequest.delete(`/admin/orders/${id}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION — gọi thẳng provinces.open-api.vn (không qua backend)
// ─────────────────────────────────────────────────────────────────────────────

export const getProvinces = async (): Promise<Province[]> => {
  try {
    const res = await fetch("https://provinces.open-api.vn/api/v2/p/");
    if (!res.ok) return [];
    const data = await res.json();
    return (data ?? []).map((p: any) => ({
      code: String(p.code),
      name: p.name,
      fullName: p.nameWithType ?? p.name,
    }));
  } catch {
    return [];
  }
};

export const getWards = async (provinceCode: string): Promise<Ward[]> => {
  try {
    const res = await fetch(
      `https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.wards ?? []).map((w: any) => ({
      code: String(w.code),
      name: w.name,
      fullName: w.nameWithType ?? w.name,
    }));
  } catch {
    return [];
  }
};

export const getUserAddresses = async (userId: string): Promise<UserAddress[]> => {
  const res = await apiRequest.get<{ data: UserAddress[] }>(
    `/admin/users/${userId}/addresses`
  );
  return res.data ?? [];
};

export const getAllOrders = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ data: Order[]; meta: any }> => {
  const res = await apiRequest.get<{ data: Order[]; meta: any }>(
    "/admin/orders", { params }
  );
  return res;
};

export const cancelOrder = async (id: string): Promise<void> => {
  await apiRequest.put(`/admin/orders/${id}`, { orderStatus: "CANCELLED" });
};

// ─── Payment status ───────────────────────────────────────────────────────────

export const updatePaymentStatus = async (
  id: string,
  paymentStatus: PaymentStatus
): Promise<Order> => {
  const res = await apiRequest.put<{ data: Order }>(
    `/admin/orders/${id}`,
    { paymentStatus }
  );
  return res.data;
};

/** Xác nhận hoàn tiền thủ công: chuyển paymentStatus → REFUNDED */
export const confirmManualRefund = async (
  id: string,
  note?: string
): Promise<Order> => {
  const res = await apiRequest.put<{ data: Order }>(
    `/admin/orders/${id}`,
    { paymentStatus: "REFUNDED" as PaymentStatus, ...(note ? { note } : {}) }
  );
  return res.data;
};

// ─── Order status ─────────────────────────────────────────────────────────────

/** Cập nhật orderStatus */
export const updateOrderStatus = async (
  id: string,
  orderStatus: OrderStatus
): Promise<Order> => {
  const res = await apiRequest.put<{ data: Order }>(
    `/admin/orders/${id}`,
    { orderStatus }
  );
  return res.data;
};

// ─── Payment method ───────────────────────────────────────────────────────────

/** Lấy danh sách phương thức thanh toán đang active */
export const getActivePaymentMethods = async (): Promise<PaymentMethod[]> => {
  const res = await apiRequest.get<{ data: PaymentMethod[] }>(
    "/admin/payment-methods",
    { params: { isActive: true } }
  );
  return res.data ?? [];
};

/** Chuyển phương thức thanh toán của đơn hàng (thường dùng để chuyển sang COD) */
export const updatePaymentMethod = async (
  id: string,
  paymentMethodId: string
): Promise<Order> => {
  const res = await apiRequest.put<{ data: Order }>(
    `/admin/orders/${id}`,
    { paymentMethodId }
  );
  return res.data;
};