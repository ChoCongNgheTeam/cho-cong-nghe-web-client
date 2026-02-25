export interface CartItemWithDetails {
   id: string;
   product_variant_id: string;
   product_id?: string;
   product_name: string;
   product_slug?: string; // thêm - từ productSlug
   brand_name?: string; // thêm - từ brandName
   variant_name: string;
   price: number;
   original_price: number;
   quantity: number;
   available_quantity?: number; // thêm - từ availableQuantity
   image_url: string;
   unit_price: number;
   discount_value: number;
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
