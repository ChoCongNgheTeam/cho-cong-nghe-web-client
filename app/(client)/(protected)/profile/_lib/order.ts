// ========================= RESPONSE =========================
export interface OrderResponse {
  data: Order[];
  message?: string;
}

// ========================= ORDER =========================
export interface Order {
  id: string;
  orderCode: string;
  userId: string;

  paymentMethodId: string;
  voucherId: string | null;
  shippingAddressId: string | null;

  // Shipping info
  shippingContactName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingWard: string;
  shippingDetail: string;

  // Money
  subtotalAmount: string;
  shippingFee: string;
  voucherDiscount: string;
  totalAmount: string;

  paymentRedirectUrl: string | null;
  paymentExpiredAt: string | null;

  // Status
  orderStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

  paymentStatus: "UNPAID" | "PAID" | "FAILED";

  orderDate: string;
  updatedAt: string;

  // Relations
  user: User;
  paymentMethod: PaymentMethod;
  voucher: Voucher | null;

  orderItems: OrderItem[];
}

// ========================= USER =========================
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

// ========================= PAYMENT =========================
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

// ========================= VOUCHER =========================
export interface Voucher {
  id: string;
  code: string;
}

// ========================= ORDER ITEM =========================
export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  image: string | null;
  productVariant: ProductVariant | null;
  // Review fields
  canReview: boolean;
  reviewId: string | null;
  reviewStatus: string | null;
}

// ========================= VARIANT =========================
export interface ProductVariant {
  id: string;
  code: string;
  price: string;

  product: Product;
  variantAttributes: VariantAttribute[];
}

// ========================= PRODUCT =========================
export interface Product {
  id: string;
  name: string;
  slug: string;
  img: ProductImage[];
}

// ========================= IMAGE =========================
export interface ProductImage {
  imageUrl: string;
  color: string;
}

// ========================= ATTRIBUTE =========================
export interface VariantAttribute {
  attributeOption: {
    value: string;
    attribute: {
      name: string;
    };
  };
}
