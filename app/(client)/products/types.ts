// types.ts
import type { ProductOption, ProductImage, CurrentVariant, Price } from "@/lib/types/product";

// ── Gallery ────────────────────────────────────────────────────────────────

export interface GalleryImage {
  id: string;
  imageUrl: string;
  altText?: string;
  position?: number;
  color?: string;
  variantId?: string;
}

export interface GalleryResponse {
  images: GalleryImage[];
  colorVariantMap: Record<string, string>;
}

// ── Variant ────────────────────────────────────────────────────────────────

/**
 * Re-export từ global để tránh duplicate.
 * OptionValue global không có `enabled` & `selected` & `image`
 * — extend thêm những field API variant trả về.
 */
// VariantOption — shape từ API /variant (có `enabled`)
export interface VariantOptionValue {
  id?: string;
  value: string;
  label: string;
  enabled: boolean;
  selected?: boolean;
  image?: { imageUrl: string };
  variantIds?: string[];
}

export interface VariantOption {
  type: string;
  values: VariantOptionValue[];
}

// ProductVariant — shape từ API /variant (images đơn giản hơn)
export interface ProductVariant {
  id: string;
  price: number;
  code?: string;
  sku?: string;
  originalPrice?: number;
  image?: string;
  color?: string;
  colorValue?: string;
  name?: string;
  availableQuantity?: number;
  stock?: number;
  quantity?: number;
  stockStatus?: "in_stock" | "out_of_stock";
  storage?: string;
  ram?: string;
  [key: string]: unknown;
  soldCount?: number;
  isDefault?: boolean;
  isActive?: boolean;
  available?: boolean;
  inventory?: import("@/lib/types/product").Inventory;
  images?: { imageUrl: string }[]; // Khác CurrentVariant — optional & shape đơn giản
}

// Re-export Price từ global để _lib/index.ts dùng chung
export type { Price as ProductPrice };

export interface VariantResponse {
  availableOptions: VariantOption[];
  currentVariant: ProductVariant;
  price: Price;
}

// ── Related Products ───────────────────────────────────────────────────────

export type { ProductDetail } from "@/lib/types/product";
import type { ProductDetail } from "@/lib/types/product";
export type RelatedProductsResponse = ProductDetail[];
