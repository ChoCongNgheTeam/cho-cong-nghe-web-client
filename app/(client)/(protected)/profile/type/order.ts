// ========================= RESPONSE =========================
export interface OrderResponse {
  data: Order[];
  message: string;
}

// ========================= ORDER =========================
export interface Order {
  id: string;
  userId: string;

  subtotalAmount: string;
  shippingFee: string;
  voucherDiscount: string;
  totalAmount: string;

  orderStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID" | "FAILED";

  orderDate: string;
  updatedAt: string;

  user: User;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  voucher: null | Voucher;
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

// ========================= ADDRESS =========================
export interface ShippingAddress {
  id: string;
  contactName: string;
  phone: string;
  detailAddress: string;
  provinceId: string;
  wardId: string;
}

// ========================= ORDER ITEM =========================
export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  productVariant: ProductVariant;
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