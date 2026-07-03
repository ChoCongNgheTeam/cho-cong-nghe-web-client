export interface Variant {
  id: string;
  name?: string;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  thumbnail: string;
  priceMin: number;
  priceMax: number;
  originalPriceMin?: number;
  promotionLabel?: string;
  inStock: boolean;
  defaultVariantId?: string;
  productUrl?: string;
  variants?: Variant[];
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

export interface ChatResponse {
  success: boolean;
  data: {
    reply: string;
    products?: Product[];
  };
}

export interface ProductCard {
  image?: string;
  imageAlt?: string;
  name?: string;
  price?: string;
  highlights: string[];
  promo?: string;
  link?: string;
  linkLabel?: string;
}
