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
  paymentMethodId?: string;
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

export const getOrderById = async (id: string): Promise<any> => {
  const res = await apiRequest.get<{ data: any }>(`/admin/orders/${id}`);
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
  payload: any
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
 * Response: { data: UserResult[], pagination: { total, page, limit, totalPages } }
 */
export async function searchUsers(q: string, limit = 10): Promise<UserResult[]> {
  const res = await apiRequest.get<{ data: UserResult[]; pagination: any }>(
    "/users/admin",
    { params: { search: q, limit, role: "CUSTOMER" } }
  );
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * GET /admin/users/:id — lấy thông tin 1 user theo ID
 */
export async function getUserById(userId: string): Promise<UserResult | null> {
  try {
    const res = await apiRequest.get<{ data: UserResult }>(`/admin/users/${userId}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}

/**
 * GET /admin/users/:userId/addresses — địa chỉ của 1 user cụ thể
 */
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
    "/admin/orders",
    { params }
  );
  return res;
};

export const cancelOrder = async (id: string): Promise<void> => {
  await apiRequest.put(`/admin/orders/${id}`, { orderStatus: "CANCELLED" });
};

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
// LOCATION APIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách tỉnh/thành từ internal API (dùng id UUID, khớp với getWards)
 */
export async function getProvinces(): Promise<Province[]> {
  try {
    const res = await fetch("https://provinces.open-api.vn/api/v2/p/");
    if (!res.ok) return [];
    const data = await res.json();
    return (data ?? []).map((p: any) => ({
      id: String(p.code),   // AddressForm dùng p.id → map code vào id
      code: String(p.code),
      name: p.name,
      fullName: p.nameWithType ?? p.name,
    }));
  } catch {
    return [];
  }
}

export async function getWards(provinceId: string): Promise<Ward[]> {
  try {
    const res = await fetch(`https://provinces.open-api.vn/api/v2/p/${provinceId}?depth=2`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.wards ?? []).map((w: any) => ({
      id: String(w.code),   // AddressForm dùng w.id
      code: String(w.code),
      name: w.name,
      fullName: w.nameWithType ?? w.name,
    }));
  } catch {
    return [];
  }
}

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

/**
 * Tìm kiếm sản phẩm — trả về tên gốc (không có variant suffix)
 * Deduplicate theo slug để mỗi sản phẩm chỉ xuất hiện 1 lần
 */
export async function searchProducts(q: string, limit = 20): Promise<ProductSearchResult[]> {
  const res = await apiRequest.get<any>("/admin/products", {
    params: { search: q, limit, isActive: true },
  });

  let raw: any[] = [];
  if (Array.isArray(res)) raw = res;
  else if (Array.isArray(res.data)) raw = res.data;
  else if (Array.isArray(res.data?.data)) raw = res.data.data;

  // Deduplicate theo slug — giữ lại 1 record đại diện cho mỗi sản phẩm
  const seen = new Set<string>();
  const results: ProductSearchResult[] = [];
  for (const item of raw) {
    const slug: string = item.slug ?? item.id;
    if (seen.has(slug)) continue;
    seen.add(slug);
    results.push({
      id: item.id,
      name: item.name,
      slug: item.slug,
      thumbnail: item.thumbnail ?? item.images?.[0] ?? null,
      category: item.category ?? { name: "" },
      brand: item.brand ?? { name: "" },
      isActive: item.isActive,
      priceOrigin: item.priceOrigin,
    });
  }
  return results;
}

/**
 * Lấy tất cả variant options của 1 sản phẩm theo slug
 * Dùng để render attribute selector (color, storage...) trong create order
 */
export async function getVariantOptions(slug: string): Promise<VariantOption[]> {
  const res = await apiRequest.get<any>(`/admin/products/${slug}/variants`);

  let raw: any[] = [];
  if (Array.isArray(res)) raw = res;
  else if (Array.isArray(res.data)) raw = res.data;
  else if (Array.isArray(res.data?.data)) raw = res.data.data;

  return raw.map((v: any) => ({
    id: v.id,
    colorLabel: v.colorLabel ?? v.color?.label ?? "",
    colorValue: v.colorValue ?? v.color?.value ?? "",
    storageLabel: v.storageLabel ?? v.storage?.label ?? "",
    storageValue: v.storageValue ?? v.storage?.value ?? "",
    price: v.price ?? 0,
    finalPrice: v.finalPrice ?? v.price ?? 0,
    discountPercentage: v.discountPercentage ?? 0,
    available: v.available ?? v.inStock ?? true,
    isDefault: v.isDefault ?? false,
    imageUrl: v.imageUrl ?? v.image ?? null,
    code: v.code ?? v.sku ?? "",
  }));
}

/**
 * Tạo đơn hàng từ admin panel
 * POST /admin/orders
 */
export async function createOrderAdmin(
  payload: CreateOrderAdminPayload
): Promise<{ data: { id: string; orderCode: string } }> {
  const res = await apiRequest.post<{ data: { id: string; orderCode: string } }>(
    "/admin/orders",
    payload
  );
  return res;
}

/** Lấy danh sách phương thức thanh toán đang active */
export const getActivePaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const res = await apiRequest.get<any>("/payment-methods", {
      params: { isActive: true },
    });
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return [];
  } catch {
    return [];
  }
};

/** Chuyển phương thức thanh toán của đơn hàng */
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