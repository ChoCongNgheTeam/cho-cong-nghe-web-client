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
  image: string;
  color: string;
  colorValue: string;
  colorLabel: string;
  storageLabel: string;
  unitPrice: number;
  originalPrice?: number;
  totalPrice: number;
  quantity: number;
  availableQuantity: number;
  addedAt?: number;
  createdAt: string;
  updatedAt: string;
  selected: boolean;
  // raw API shape (transform xong thì không dùng nữa)
  unit_price?: number;
  totalFinalPrice?: number;
  price?: { base: number; final: number };
}

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
  image: string;
  color: string;
  colorValue: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCartData {
  items: ApiCartItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
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
  failedIds?: string[];
}

// ── Thêm mới cho store ──────────────────────────────────────────

export interface AddToCartMeta {
  productId?: string;
  productName?: string;
  productSlug?: string;
  brandName?: string;
  variantName?: string;
  colorLabel?: string;
  storageLabel?: string;
  color?: string; // alias colorLabel (backward compat)
  colorValue?: string;
  imageUrl?: string;
  price: number;
  originalPrice: number;
  discountPercentage?: number;
  availableQuantity?: number;
}

export interface NewVariantData {
  id: string;
  colorLabel: string;
  storageLabel: string;
  price: number;
  originalPrice?: number;
  colorValue?: string;
}

export interface SyncCartPayload {
  productVariantId: string;
  quantity: number;
  addedAt?: number;
}

// ── Derived/computed (dùng trong selectTotals) ──────────────────

export interface CartTotals {
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  rewardPoints: number;
}
