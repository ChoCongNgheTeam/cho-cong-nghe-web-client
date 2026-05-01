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
  newAddress?: {
    provinceCode: number;
    provinceName: string;
    wardCode: number;
    wardName: string;
    detailAddress: string;
  };
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

/**
 * Province từ https://provinces.open-api.vn/api/v2/p/
 */
export interface Province {
  code: number; // Dùng làm key — e.g. 1, 79
  name: string; // e.g. "Thành phố Hà Nội"
  codename: string; // e.g. "ha_noi"
  division_type: string;
  phone_code: number;
}

/**
 * Ward từ https://provinces.open-api.vn/api/v2/p/{provinceCode}?depth=2
 */
export interface Ward {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  province_code: number;
}

export interface UserAddress {
  id: string;
  contactName: string;
  phone: string;
  detailAddress: string;
  wardName: string;
  provinceName: string;
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
  code: string;
  price: number;
  finalPrice: number; // nếu BE có promotion engine
  discountPercentage: number;
  available: boolean;
  isDefault: boolean;
  imageUrl: string | null;

  // Known attrs (backward compat)
  colorLabel: string;
  colorValue: string;
  storageLabel: string;
  storageValue: string;

  // Dynamic attrs — ramLabel, ramValue, bundleLabel, bundleValue...
  [key: string]: unknown;

  // Structured map
  attributes: Record<string, { value: string; label: string }>;
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
  price?: {
    base: number;
    final: number;
    discountPercentage: number;
    hasPromotion: boolean;
  };
}

export interface OrderPreviewResult {
  shippingFee: number;
  subtotal: number;
  voucherDiscount: number;
  total: number;
  // Một số BE còn trả thêm:
  shippingMethod?: string;
  estimatedDays?: number;
}

export interface VoucherValidateResult {
  discount: number;
  voucher: { id: string; code: string };
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
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, { orderStatus });
}

export async function updatePaymentStatus(id: string, paymentStatus: "UNPAID" | "PAID" | "REFUND_PENDING" | "REFUNDED"): Promise<OrderDetailResponse> {
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, { paymentStatus });
}

export async function confirmManualRefund(id: string, refundNote?: string): Promise<{ success: boolean; message: string }> {
  return apiRequest.post(`/orders/admin/${id}/confirm-refund`, { refundNote });
}

export async function updateOrderShipping(id: string, payload: UpdateShippingPayload): Promise<OrderDetailResponse> {
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, payload);
}

export async function cancelOrder(id: string): Promise<CancelOrderResponse> {
  return apiRequest.post<CancelOrderResponse>(`/orders/admin/${id}/cancel`);
}

export async function updatePaymentMethod(id: string, paymentMethodId: string): Promise<OrderDetailResponse> {
  return apiRequest.patch<OrderDetailResponse>(`/orders/admin/${id}`, { paymentMethodId });
}

// ─────────────────────────────────────────────────────────────────────────────
// USER APIS
// ─────────────────────────────────────────────────────────────────────────────

export async function searchUsers(q: string, limit = 10): Promise<UserResult[]> {
  const res = await apiRequest.get<{ data: UserResult[]; pagination: any }>("/users/admin", {
    params: { search: q, limit, role: "CUSTOMER" },
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function getUserById(userId: string): Promise<UserResult | null> {
  try {
    const res = await apiRequest.get<{ data: UserResult }>(`/users/admin/${userId}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  const res = await apiRequest.get<{ data: UserAddress[] }>("/addresses/admin/all", {
    params: { userId },
  });
  return Array.isArray(res.data) ? res.data : [];
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION APIS — provinces.open-api.vn
// ─────────────────────────────────────────────────────────────────────────────

const PROVINCES_API = "https://provinces.open-api.vn/api/v2";

/**
 * Lấy tất cả tỉnh/thành phố.
 * GET https://provinces.open-api.vn/api/v2/p/
 * Response: Province[]  (array trực tiếp, không wrap)
 */
export async function getProvinces(): Promise<Province[]> {
  const res = await fetch(`${PROVINCES_API}/p/`);
  if (!res.ok) throw new Error("Không thể tải danh sách tỉnh/thành");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Lấy danh sách phường/xã theo mã tỉnh.
 * GET https://provinces.open-api.vn/api/v2/p/{provinceCode}?depth=2
 * Response: { ...province, wards: Ward[] }
 */
export async function getWards(provinceCode: number): Promise<Ward[]> {
  const res = await fetch(`${PROVINCES_API}/p/${provinceCode}?depth=2`);
  if (!res.ok) throw new Error("Không thể tải danh sách phường/xã");
  const data = await res.json();
  return Array.isArray(data.wards) ? data.wards : [];
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * apiRequest đã unwrap response một lớp:
 *   BE trả về  { data: [...], message: "..." }
 *   apiRequest trả về  { data: [...], message: "..." }  (tức là res = BE response)
 * Nên res.data là array payment methods trực tiếp.
 */
export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  const res = await apiRequest.get<{ data: PaymentMethod[]; message: string }>("/payments/active");
  // res.data là array (sau khi apiRequest unwrap lớp ngoài)
  if (Array.isArray(res.data)) return res.data;
  // Fallback: nếu apiRequest không unwrap (raw response)
  if (Array.isArray(res)) return res as any;
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT APIS
// ─────────────────────────────────────────────────────────────────────────────

export async function searchProducts(q: string, limit = 8): Promise<ProductSearchResult[]> {
  const res = await apiRequest.get<any>("/products", { params: { search: q, limit } });

  let raw: any[] = [];
  if (Array.isArray(res)) raw = res;
  else if (Array.isArray(res.data)) raw = res.data;
  else if (Array.isArray(res.data?.data)) raw = res.data.data;

  const seen = new Set<string>();
  const deduped: ProductSearchResult[] = [];
  for (const p of raw) {
    if (!p.slug || seen.has(p.slug)) continue;
    seen.add(p.slug);
    deduped.push({
      id: p.id,
      name: stripVariantSuffix(p.name),
      slug: p.slug,
      thumbnail: p.thumbnail ?? null,
      category: p.category ?? { name: "" },
      brand: p.brand ?? { name: "" },
      priceOrigin: p.priceOrigin,
      price: p.price ?? null,
    });
  }
  return deduped;
}

function stripVariantSuffix(name: string): string {
  if (!name) return name;
  const m = name.match(/^(.*?)\s+\d+\s*(GB|TB|MB)\b/i);
  return m && m[1] ? m[1].trim() : name;
}

export async function getVariantOptions(slug: string): Promise<VariantOption[]> {
  const res = await apiRequest.get<{ data: VariantOption[] }>(`/products/slug/${slug}/variant-options`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function exportOrders(params: {
  format: "excel" | "csv";
  status?: string;
  paymentStatus?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ blob: Blob; filename: string; count: number }> {
  const { format, status, paymentStatus, search, dateFrom, dateTo } = params;

  const queryParams: Record<string, any> = { format };
  if (status && status !== "ALL") queryParams.status = status;
  if (paymentStatus && paymentStatus !== "ALL") queryParams.paymentStatus = paymentStatus;
  if (search) queryParams.search = search;
  if (dateFrom) queryParams.dateFrom = dateFrom;
  if (dateTo) queryParams.dateTo = dateTo;

  // apiRequest tự build: ${BASE_URL}/api/v1/orders/admin/export?...
  // responseType: "blob" để nhận binary file thay vì parse JSON
  const blob = await apiRequest.get<Blob>("/orders/admin/export", {
    params: queryParams,
    responseType: "blob",
  });

  const ext = format === "excel" ? "xlsx" : "csv";
  const filename = `orders_export_${Date.now()}.${ext}`;

  return { blob, filename, count: 0 };
}

/**
 * Gọi /checkout/preview với các params của admin order.
 * Dùng khi:
 *  - Đã chọn shippingAddressId (địa chỉ có sẵn của user)
 *  - Đã có ít nhất 1 item trong cart
 *
 * NOTE: API này dùng cartItemIds (cart DB ids) — phía admin không có.
 * Thay vào đó, ta dùng endpoint riêng /orders/admin/preview nếu BE có,
 * hoặc fallback về /checkout/preview với variantIds + qty.
 */
export async function getOrderPreviewAdmin(params: {
  shippingAddressId: string;
  paymentMethodId: string;
  variantIds: string[]; // dùng thay cartItemIds cho admin flow
  voucherId?: string;
}): Promise<OrderPreviewResult | null> {
  try {
    const searchParams = new URLSearchParams({
      paymentMethodId: params.paymentMethodId,
      shippingAddressId: params.shippingAddressId,
      ...(params.voucherId ? { voucherId: params.voucherId } : {}),
    });
    // Admin gửi variantIds thay cho cartItemIds
    params.variantIds.forEach((id) => searchParams.append("variantIds[]", id));

    const res = await apiRequest.get<{ success: boolean; data: OrderPreviewResult }>(`/checkout/preview?${searchParams.toString()}`);
    return res?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Validate voucher code cho admin order.
 * Trả về discount amount thực tế từ server, hoặc null nếu không hợp lệ.
 */
export async function validateVoucherAdmin(params: {
  code: string;
  orderTotal: number;
  cartItems: Array<{
    productId: string;
    categoryId?: string;
    brandId?: string;
    categoryPath?: string[];
    itemTotal?: number;
  }>;
}): Promise<{ discount: number; voucherId: string; message?: string } | null> {
  try {
    const res = await apiRequest.post<{
      data: { discount: number; voucher: { id: string } } | null;
      message?: string;
    }>("/vouchers/validate", {
      code: params.code.trim().toUpperCase(),
      orderTotal: params.orderTotal,
      cartItems: params.cartItems,
    });

    if (!res.data) return null;
    return {
      discount: res.data.discount,
      voucherId: res.data.voucher.id,
      message: res.message,
    };
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? "Mã voucher không hợp lệ";
    throw new Error(msg);
  }
}

export async function checkEmailExists(email: string): Promise<{ exists: boolean; user?: UserResult }> {
  try {
    const res = await apiRequest.get<{ data: UserResult[]; pagination: any }>("/users/admin", {
      params: { search: email, limit: 1, role: "CUSTOMER" },
    });
    const users = Array.isArray(res.data) ? res.data : [];
    // So khớp chính xác email (search có thể trả về partial match)
    const matched = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    return { exists: !!matched, user: matched };
  } catch {
    return { exists: false };
  }
}
