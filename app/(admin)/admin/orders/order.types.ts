// ─── Enums ────────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUND_PENDING" | "REFUNDED";
// ─── Entities ─────────────────────────────────────────────────────────────────

export interface OrderUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

export interface AttributeOption {
  value: string;
  attribute: { name: string };
}

export interface VariantAttribute {
  attributeOption: AttributeOption;
}

export interface ProductImage {
  imageUrl: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  img: ProductImage[];
}

export interface ProductVariant {
  id: string;
  code: string;
  price: string;
  product: Product;
  variantAttributes: VariantAttribute[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  productVariant: ProductVariant;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  paymentMethodId: string;
  voucherId: string | null;
  voucherCode?: string | null;
  shippingAddressId: string | null;
  // ── Shipping snapshot (lưu trực tiếp trên order) ──
  shippingContactName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingWard: string;
  shippingDetail: string;
  // ── Money ──
  subtotalAmount: string;
  shippingFee: string;
  voucherDiscount: string;
  totalAmount: string;
  // ── Status ──
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  updatedAt: string;
  // ── Relations ──
  user: OrderUser;
  paymentMethod: PaymentMethod;
  voucher: null | { id: string; code: string };
  orderItems: OrderItem[];
  refundedAt?: string | null;
  refundedBy?: string | null;
  refundNote?: string | null;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  message: string;
}
