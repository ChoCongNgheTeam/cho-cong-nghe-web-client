import apiRequest from "@/lib/api";
import type { Order, OrderStatus, PaymentStatus } from "../order.types";

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface OrdersResponse {
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    statusCounts: Record<string, number>;
  };
  message: string;
}

export interface OrderDetailResponse {
  data: Order;
  message: string;
}

export interface CancelOrderResponse {
  message: string;
}

export interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateOrderAdminPayload {
  orderStatus?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  paymentStatus?: "UNPAID" | "PAID" | "REFUND_PENDING" | "REFUNDED";
  paymentMethodId?: string; // ← thêm field này
  shippingFee?: number;
  voucherDiscount?: number;
}

export interface UpdateShippingPayload {
  shippingContactName?: string;
  shippingPhone?: string;
  shippingProvince?: string;
  shippingWard?: string;
  shippingDetail?: string;
  shippingAddressId?: string;
}

export interface CreateOrderAdminPayload {
  userId?: string;
  shippingAddressId?: string;
  customerInfo?: { fullName: string; phone: string; email?: string };
  newAddress?: { provinceId: string; wardId: string; detailAddress: string };
  items: { productVariantId: string; quantity: number; unitPrice: number }[];
  voucherCode?: string;
  shippingFee: number;
  paymentMethodId: string;
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  orderStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

// ─────────────────────────────────────────────────────────────────────────────
// USER / ADDRESS / LOCATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Province {
  id: string;
  name: string;
  fullName: string;
  code: string;
}
export interface Ward {
  id: string;
  name: string;
  fullName: string;
  code: string;
}

export interface UserAddress {
  id: string;
  contactName: string;
  phone: string;
  detailAddress: string;
  province: { id: string; name: string; fullName: string };
  ward: { id: string; name: string; fullName: string };
  isDefault: boolean;
  deletedAt: string | null;
}

export interface UserResult {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface VariantOption {
  id: string;
  colorLabel: string;
  colorValue: string;
  storageLabel: string;
  storageValue: string;
  price: number;
  finalPrice: number;
  discountPercentage: number;
  available: boolean;
  isDefault: boolean;
  imageUrl: string | null;
  code: string;
}

/**
 * Product từ search result.
 * name có thể có variant suffix ("iPhone 13 128GB") — dùng baseName để hiển thị tên gốc.
 * baseName được tính FE bằng cách deduplicate theo slug.
 */
export interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  category: { id?: string; name: string };
  brand: { id?: string; name: string };
  isActive?: boolean;
  priceOrigin?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER APIS
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
// USER APIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /users/admin?search=&limit=10&role=CUSTOMER
 * Response shape: { data: UserResult[], pagination: { total, page, limit, totalPages } }
 *
 * FIX: endpoint là /users/admin (không phải /users/admin/all)
 * FIX: parse res.data (không phải res.data.data)
 */
export async function searchUsers(q: string, limit = 10): Promise<UserResult[]> {
  const res = await apiRequest.get<{ data: UserResult[]; pagination: any }>("/users/admin", { params: { search: q, limit, role: "CUSTOMER" } });
  // Controller trả về { data: users[], pagination: {...} }
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * GET /users/admin/:id — lấy thông tin 1 user theo ID
 */
export async function getUserById(userId: string): Promise<UserResult | null> {
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
    return null;
  }
}

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

export async function getWards(provinceId: string): Promise<Ward[]> {
  const res = await apiRequest.get<any>(`/addresses/locations/${provinceId}/wards`);
  // Controller: { success, data: Ward[], meta: {...} }
  // apiRequest có thể unwrap 1 lần → res = { success, data: Ward[], meta }
  // hoặc không unwrap → res.data = { success, data: Ward[], meta }
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data; // data là array trực tiếp
  if (Array.isArray(res.data?.data)) return res.data.data; // data.data là array (nested)
  return [];
}

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

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT APIS
// ─────────────────────────────────────────────────────────────────────────────

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

  // Handle multiple response shapes:
  // { data: { data: [...] } } — paginated  |  { data: [...] } — array  |  [...] — raw
  let raw: any[] = [];
  if (Array.isArray(res)) raw = res;
  else if (Array.isArray(res.data)) raw = res.data;
  else if (Array.isArray(res.data?.data)) raw = res.data.data;

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
