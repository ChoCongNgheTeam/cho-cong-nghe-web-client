// ─── Enums (phải khớp chính xác với database) ────────────────────────────────

export type OrderStatus =
   | "PENDING"
   | "PROCESSING"
   | "SHIPPED"
   | "DELIVERED"
   | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

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

export interface ShippingAddress {
   id: string;
   contactName: string;
   phone: string;
   detailAddress: string;
   provinceId: string;
   wardId: string;
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
   userId: string;
   paymentMethodId: string;
   voucherId: string | null;
   shippingAddressId: string;
   subtotalAmount: string;
   shippingFee: string;
   voucherDiscount: string;
   totalAmount: string;
   orderStatus: OrderStatus;
   paymentStatus: PaymentStatus;
   orderDate: string;
   updatedAt: string;
   user: OrderUser;
   paymentMethod: PaymentMethod;
   voucher: null | { id: string; code: string };
   shippingAddress: ShippingAddress;
   orderItems: OrderItem[];
}

export interface OrdersResponse {
   data: Order[];
   total: number;
   message: string;
}
