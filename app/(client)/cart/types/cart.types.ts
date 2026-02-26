export interface CartItemWithDetails {
   id: string;
   productVariantId: string;
   productId: string;
   productName: string;
   productSlug: string;
   brandName: string;
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
   // client-side only
   selected: boolean;
   originalPrice?: number;
}
export interface ApiCartItem {
   id: string;
   productVariantId: string;
   productId: string;
   productName: string;
   productSlug: string;
   brandName: string;
   variantCode: string;
   image: string;
   color: string; // thêm
   colorValue: string; // thêm
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
}
