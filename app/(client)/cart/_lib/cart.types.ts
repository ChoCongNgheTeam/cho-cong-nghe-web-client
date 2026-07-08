// Field thật theo response GET /api/v1/cart — đối chiếu trực tiếp với API,
// bỏ hẳn field snake_case (unit_price...) vì dữ liệu thật không bao giờ trả về dạng đó

export interface VariantAttribute {
  code: string;
  value: string;
}

export interface CartItemPrice {
  base: number;
  final: number;
  discountAmount: number;
  discountPercentage: number;
  hasPromotion: boolean;
}

export interface CartItemWithDetails {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  brandName: string;
  brandId?: string;
  categoryId?: string;
  categoryPath?: string[];
  variantCode: string;
  variantAttributes?: VariantAttribute[];
  image: string;
  // color display
  color: string; // label hiển thị, vd: "Trắng"
  colorValue: string; // slug/hex cho swatch, vd: "white" | "#fff"
  colorLabel: string; // === color, dùng cho API param
  storageLabel: string; // vd: "128GB", dùng cho API param
  // pricing
  unitPrice: number;
  originalPrice?: number;
  totalPrice: number;
  totalBasePrice?: number;
  totalFinalPrice?: number;
  price?: CartItemPrice;
  // inventory
  quantity: number;
  availableQuantity: number;
  // timestamps
  addedAt?: number; // unix ms, guest only
  createdAt: string;
  updatedAt: string;
  // client-side UI state
  selected: boolean;
}

// TODO: API GET /cart thực tế KHÔNG trả field "image" ở cấp item — cần xem
// useCart.ts để biết image được enrich từ đâu (gallery/variant riêng?) trước
// khi khẳng định field này đúng hay sai.
export interface ApiCartItem {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryPath: string[];
  variantCode: string;
  variantAttributes?: VariantAttribute[];
  image: string;
  color: string;
  colorValue: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  totalBasePrice?: number;
  totalFinalPrice?: number;
  price?: CartItemPrice;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCartData {
  items: ApiCartItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  totalPromotionDiscount?: number;
  totalVoucherDiscount?: number;
  totalDiscount?: number;
  finalTotal?: number;
  isValid?: boolean;
  errors?: string[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiResult {
  success: boolean;
  data?: ApiCartData;
  error?: string;
  warnings?: string[];
}