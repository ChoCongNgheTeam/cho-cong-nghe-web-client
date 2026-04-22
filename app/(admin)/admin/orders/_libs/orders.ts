import apiRequest from "@/lib/api";
import type { Order, OrderStatus, PaymentStatus } from "../order.types";

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface Province {
  code: string;   // ← đổi id → code
  name: string;
  fullName: string;
}

export interface Ward {
  code: string;   // ← đổi id → code
  name: string;
  fullName: string;
}

export interface UserAddress {
  id: string;
  contactName: string;
  phone: string;
  detailAddress: string;
  fullAddress?: string;
  province: { code: string; name: string; fullName?: string };  // ← code
  ward: { code: string; name: string; fullName?: string };      // ← code
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
    provinceCode: string;   // ← đổi provinceId → provinceCode
    wardCode: string;       // ← đổi wardId → wardCode
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
  // ← param đổi từ provinceId → provinceCode
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