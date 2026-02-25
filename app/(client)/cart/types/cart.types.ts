// cart/context/cart.types.ts

export interface CartItemWithDetails {
  id: string;                    // UUID từ DB hoặc "local_xxx" cho guest
  product_variant_id: string;    // UUID
  product_id?: string;           // UUID
  product_name: string;
  variant_name: string;
  price: number;
  original_price: number;
  quantity: number;
  image_url: string;
  unit_price: number;
  discount_value: number;
  selected: boolean;             // client-side only
}