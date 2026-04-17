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

export async function getAllOrders(params?: GetAllOrdersParams): Promise<OrdersResponse> {
  return apiRequest.get<OrdersResponse>("/orders/admin/all", { params });
}

export async function getOrderById(id: string): Promise<OrderDetailResponse> {
  return apiRequest.get<OrderDetailResponse>(`/orders/admin/${id}`);
}

export async function createOrderAdmin(payload: CreateOrderAdminPayload): Promise<OrderDetailResponse> {
  return apiRequest.post<OrderDetailResponse>("/orders/admin", payload);
}

export async function updateOrderAdmin(id: string, payload: UpdateOrderAdminPayload): Promise<OrderDetailResponse> {
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, payload);
}

export async function updateOrderStatus(id: string, orderStatus: string): Promise<OrderDetailResponse> {
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, {
    orderStatus,
  });
}

export async function updatePaymentStatus(id: string, paymentStatus: "UNPAID" | "PAID" | "REFUND_PENDING" | "REFUNDED"): Promise<OrderDetailResponse> {
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, {
    paymentStatus,
  });
}

// API mới — staff xác nhận đã chuyển tiền hoàn thủ công
export async function confirmManualRefund(id: string, refundNote?: string): Promise<{ success: boolean; message: string }> {
  return apiRequest.post(`/orders/admin/${id}/confirm-refund`, { refundNote });
}

export async function updateOrderShipping(id: string, payload: UpdateShippingPayload): Promise<OrderDetailResponse> {
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, payload);
}

export async function cancelOrder(id: string): Promise<CancelOrderResponse> {
  return apiRequest.post<CancelOrderResponse>(`/orders/admin/${id}/cancel`);
}

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
    const res = await apiRequest.get<{ data: UserResult }>(`/users/admin/${userId}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}

/**
 * GET /addresses/admin/all?userId=xxx
 * FIX: truyền userId param để chỉ lấy địa chỉ của user đó, không phải tất cả
 */
export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  const res = await apiRequest.get<{ data: UserAddress[] }>("/addresses/admin/all", { params: { userId } });
  return Array.isArray(res.data) ? res.data : [];
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION APIS
// ─────────────────────────────────────────────────────────────────────────────

export async function getProvinces(): Promise<Province[]> {
  const res = await apiRequest.get<any>("/addresses/locations/provinces");
  // Controller: { success, data: Province[] } — handle cả unwrapped và nested
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
}

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

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT METHODS
// ─────────────────────────────────────────────────────────────────────────────

export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  const res = await apiRequest.get<{ data: PaymentMethod[] }>("/payments/active");
  return Array.isArray(res.data) ? res.data : [];
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT APIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /products?search=iphone&limit=8
 *
 * Dùng public endpoint thay vì /products/admin/all vì:
 * - Trả về đúng format card với name có thể deduplicate theo slug
 * - 1 slug = 1 sản phẩm gốc → group theo slug để hiển thị tên sạch
 *
 * Response: { data: { data: ProductSearchResult[], total, ... } }
 */
export async function searchProducts(q: string, limit = 8): Promise<ProductSearchResult[]> {
  const res = await apiRequest.get<any>("/products", {
    params: { search: q, limit },
  });

  // Handle multiple response shapes:
  // { data: { data: [...] } } — paginated  |  { data: [...] } — array  |  [...] — raw
  let raw: any[] = [];
  if (Array.isArray(res)) raw = res;
  else if (Array.isArray(res.data)) raw = res.data;
  else if (Array.isArray(res.data?.data)) raw = res.data.data;

  // Deduplicate theo slug — 1 slug = 1 sản phẩm gốc
  const seen = new Set<string>();
  const deduped: ProductSearchResult[] = [];
  for (const p of raw) {
    if (!p.slug || seen.has(p.slug)) continue;
    seen.add(p.slug);
    deduped.push({
      id: p.id,
      name: stripVariantSuffix(p.name), // "iPhone 13 128GB" → "iPhone 13"
      slug: p.slug,
      thumbnail: p.thumbnail ?? null,
      category: p.category ?? { name: "" },
      brand: p.brand ?? { name: "" },
      priceOrigin: p.priceOrigin,
    });
  }
  return deduped;
}

/**
 * Strip variant suffix: "iPhone 13 128GB" → "iPhone 13"
 * "MacBook Air 13 M2 2024 16GB 256GB 8-core" → "MacBook Air 13 M2 2024"
 * "Apple EarPods Lightning (MMTN2ZA/A)"      → unchanged (no GB/TB)
 */
function stripVariantSuffix(name: string): string {
  if (!name) return name;
  const m = name.match(/^(.*?)\s+\d+\s*(GB|TB|MB)\b/i);
  return m && m[1] ? m[1].trim() : name;
}

/**
 * GET /products/slug/:slug/variant-options
 * Trả về tất cả variant options (colors, storages...) với pricing
 */
export async function getVariantOptions(slug: string): Promise<VariantOption[]> {
  const res = await apiRequest.get<{ data: VariantOption[] }>(`/products/slug/${slug}/variant-options`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function updatePaymentMethod(id: string, paymentMethodId: string): Promise<OrderDetailResponse> {
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, {
    paymentMethodId,
  });
}
