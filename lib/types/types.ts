// lib/types.ts
// =====================
// TYPE DEFINITIONS
// =====================

export interface Banner {
   id: string;
   title: string;
   image: string;
   link: string;
   type: "main" | "hot" | "laptop" | "seasonal" | "promo";
}

export interface Category {
   id: string;
   name: string;
   slug: string;
   image: string;
   productCount?: number;
}

export interface Product {
   id: string;
   name: string;
   price: number;
   salePrice?: number;
   image: string;
   categoryId: string;
   categorySlug: string;
   categoryName?: string;
   isHot: boolean;
   isFeatured: boolean;
   rating?: number;
   reviewCount?: number;
   specs?: string[];
   badge?: string;
}

export interface SaleEvent {
   id: string;
   title: string;
   banner: string;
   startAt: Date;
   endAt: Date;
   productIds: string[];
   products?: Product[];
}

export interface Blog {
   id: string;
   title: string;
   thumbnail: string;
   content: string;
   excerpt?: string;
   createdAt: Date;
   slug: string;
   category?: string;
}

export interface SeasonalSale {
   id: string;
   season: string;
   title: string;
   banner: string;
   productIds: string[];
   products?: Product[];
}

export interface PromoBanner {
   id: string;
   title: string;
   image: string;
   link: string;
   size: "small" | "medium" | "large";
}