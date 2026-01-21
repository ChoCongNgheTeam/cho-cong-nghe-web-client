// TypeScript Interfaces & Types for Checkout Flow
// Place this file in: app/(client)/checkout/types/index.ts

// ==================== USER ====================
export interface UserInfo {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  gender?: 'male' | 'female' | 'other';
  avatar_image?: string;
  role?: string;
  is_active?: boolean;
}

// ==================== ADDRESS ====================
export interface Address {
  id: number;
  user_id?: number;
  contact_name: string;
  phone: string;
  detail_address: string;
  province_id: number;
  district_id: number;
  ward_id: number;
  province_name?: string;
  district_name?: string;
  ward_name?: string;
  type: 'home' | 'office' | 'other';
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Province {
  id: number;
  name: string;
  code?: string;
}

export interface District {
  id: number;
  province_id: number;
  name: string;
  code?: string;
}

export interface Ward {
  id: number;
  district_id: number;
  name: string;
  code?: string;
}

// ==================== CART ====================
export interface CartItem {
  id: number;
  user_id: number;
  product_variant_id: number;
  quantity: number;
  unit_price: number;
  discount_value: number;
  name?: string;
  variant?: string;
  image?: string;
  product_name?: string;
  variant_name?: string;
  stock_quantity?: number;
  created_at?: string;
  updated_at?: string;
}

// ==================== PRODUCT ====================
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  brand_id?: number;
  category_id?: number;
  rating_average?: number;
  rating_count?: number;
  sold_count?: number;
  views_count?: number;
  is_active: boolean;
  is_featured: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  code: string;
  price: number;
  weight?: number;
  sold_count?: number;
  is_default: boolean;
  is_active: boolean;
}

// ==================== ORDER ====================
export interface Order {
  id: number;
  user_id: number;
  address_id: number;
  payment_method_id: number;
  voucher_id?: number;
  shipping_address: string;
  subtotal_amount: number;
  shipping_fee: number;
  voucher_discount: number;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending'       // Chờ xác nhận
  | 'confirmed'     // Đã xác nhận
  | 'preparing'     // Đang chuẩn bị hàng
  | 'shipping'      // Đang giao hàng
  | 'delivered'     // Đã giao hàng
  | 'cancelled'     // Đã hủy
  | 'returned';     // Đã trả hàng

export type PaymentStatus =
  | 'unpaid'        // Chưa thanh toán
  | 'paid'          // Đã thanh toán
  | 'refunded';     // Đã hoàn tiền

export interface OrderItem {
  id: number;
  order_id: number;
  product_variant_id: number;
  quantity: number;
  unit_price: number;
  discount_value: number;
  product_name?: string;
  variant_name?: string;
  image?: string;
}

// ==================== PAYMENT ====================
export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  sort_order?: number;
}

// ==================== VOUCHER ====================
export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_uses: number;
  max_uses_per_user: number;
  used_count: number;
  start_date: string;
  end_date: string;
  priority: number;
  is_active: boolean;
}

export interface VoucherValidation {
  valid: boolean;
  voucher?: Voucher;
  discount_amount?: number;
  message?: string;
}

// ==================== TIME SLOT ====================
export interface TimeSlot {
  date: string;
  displayDate: string;
  slots: Array<{
    time: string;
    available: boolean;
  }>;
}

export interface DeliveryTime {
  date: string;
  time: string;
  displayText?: string;
}

// ==================== CHECKOUT ====================
export interface CheckoutData {
  user_id: number;
  address_id: number;
  contact_name: string;
  phone: string;
  payment_method_id: number;
  delivery_date: string;
  delivery_time: string;
  notes?: string;
  request_invoice: boolean;
  use_points: boolean;
  voucher_code?: string;
  items: Array<{
    product_variant_id: number;
    quantity: number;
  }>;
}

export interface OrderSummary {
  subtotal: number;
  discounts: number;
  shipping: number;
  voucher_discount?: number;
  points_discount?: number;
  total: number;
  points_earned?: number;
}

// ==================== API RESPONSE ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface OrderResponse {
  order_id: number;
  order_code: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
}

// ==================== FORM DATA ====================
export interface UserUpdateData {
  name: string;
  phone: string;
  email: string;
}

export interface AddressFormData {
  contact_name: string;
  phone: string;
  detail_address: string;
  province_id: number;
  district_id: number;
  ward_id: number;
  type: 'home' | 'office' | 'other';
  is_default: boolean;
}

// ==================== COMPONENT PROPS ====================
export interface UserInfoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: UserInfo | null;
  onUpdate: (data: UserUpdateData) => void;
}

export interface AddressSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedAddress: number | undefined;
  onSelect: (address: Address) => void;
  onAdd?: () => void;
  onEdit?: (address: Address) => void;
}

export interface TimeSlotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string, time: string) => void;
  selectedSlot?: string;
  selectedDate?: string;
}

export interface CartItemsProps {
  items: CartItem[];
  editable?: boolean;
  onUpdateQuantity?: (itemId: number, quantity: number) => void;
  onRemove?: (itemId: number) => void;
}

export interface OrderSummaryProps {
  subtotal: number;
  discounts: number;
  shipping: number;
  voucher_discount?: number;
  total: number;
  points?: number;
  onCheckout: () => void;
  loading?: boolean;
}

export interface PaymentMethodsProps {
  methods?: PaymentMethod[];
  selectedMethod?: number;
  onSelect?: (methodId: number) => void;
}

// ==================== UTILITY TYPES ====================
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ==================== CONSTANTS ====================
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
  returned: 'Đã trả hàng',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  refunded: 'Đã hoàn tiền',
};

export const ADDRESS_TYPE_LABELS = {
  home: 'Nhà riêng',
  office: 'Văn phòng',
  other: 'Khác',
} as const;