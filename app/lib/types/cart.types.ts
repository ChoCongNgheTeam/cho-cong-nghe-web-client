// types/cart.types.ts

// Cart Item from database
export interface CartItem {
  id: number;
  user_id: number;
  product_variant_id: number;
  quantity: number;
  unit_price: number;
  discount_value: number;
  product_variant?: ProductVariant;
}

// Product Variant
export interface ProductVariant {
  id: number;
  product_id: number;
  price: number;
  sold_count: number;
  product?: Product;
  product_variant_images?: ProductVariantImage[];
  variants_attributes?: VariantAttribute[];
  inventory?: Inventory;
}

// Product
export interface Product {
  id: number;
  brand_id: number;
  name: string;
  slug: string;
  description: string;
  code: string;
  views_count: number;
  rating_average: number;
  rating_count: number;
  is_active: boolean;
  is_featured: boolean;
}

// Product Variant Image
export interface ProductVariantImage {
  id: number;
  product_variant_id: number;
  img_url: string;
  alt_text: string;
  position: number;
}

// Variant Attribute
export interface VariantAttribute {
  product_variant_id: number;
  attributes_option_id: number;
  attributes_option?: AttributeOption;
}

// Attribute Option
export interface AttributeOption {
  id: number;
  attribute_id: number;
  value: string;
  attribute?: Attribute;
}

// Attribute
export interface Attribute {
  id: number;
  name: string;
  description: string;
}

// Inventory
export interface Inventory {
  id: number;
  product_variant_id: number;
  quantity: number;
  reserved_quantity: number;
}

// Cart Item with all details (for display)
export interface CartItemWithDetails {
  id: number;
  product_variant_id: number;
  product_name: string;
  variant_name: string;
  price: number;
  original_price: number;
  quantity: number;
  image_url: string;
  unit_price: number;
  discount_value: number;
  selected: boolean;
}

// Order
export interface Order {
  id: number;
  user_id: number;
  shipping_address_id: number;
  payment_method_id: number;
  voucher_id: number | null;
  subtotal_amount: number;
  total_amount: number;
  shipping_fee: number;
  voucher_discount: number;
  order_status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipping"
    | "delivered"
    | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  created_at: Date;
  updated_at: Date;
}

// Order Item
export interface OrderItem {
  id: number;
  order_id: number;
  product_variant_id: number;
  quantity: number;
  unit_price: number;
  discount_value: number;
}

// Voucher
export interface Voucher {
  id: number;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number;
  max_uses: number;
  max_uses_per_user: number;
  used_count: number;
  start_date: Date;
  end_date: Date;
  priority: number;
  is_active: boolean;
}

// Voucher Usage
export interface VoucherUsage {
  id: number;
  voucher_id: number;
  user_id: number;
  order_id: number | null;
  used_at: Date | null;
  assigned_at: Date;
  used_count: number;
}

// User Address
export interface UserAddress {
  id: number;
  user_id: number;
  contact_name: string;
  phone: string;
  province_id: number;
  district_id: number;
  ward_id: number;
  detail_address: string;
  type: "home" | "office" | "other";
  is_default: boolean;
}

// Payment Method
export interface PaymentMethod {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

// Cart Summary
export interface CartSummary {
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  voucherDiscount: number;
  shippingFee: number;
  total: number;
  rewardPoints: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Cart Actions Response
export type CartActionResponse = ApiResponse<CartItem | CartItem[] | null>;