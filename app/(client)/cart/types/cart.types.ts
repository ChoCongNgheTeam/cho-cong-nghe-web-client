export interface CartItemWithDetails {
   id: string;
   productVariantId: string;
   productId: string;
   productName: string;
   productSlug: string;
   brandName: string;
   variantCode: string;
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

export interface ApiCartItem {
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
