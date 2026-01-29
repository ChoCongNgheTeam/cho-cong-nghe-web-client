export interface Product {
   id: string;
   name: string;
   priceOrigin: number;
   slug: string;
   thumbnail: string;
   rating: {
      average: number;
      count: number;
   };
   isFeatured: boolean;
   isNew: boolean;
   highlights: Highlight[];
   inStock: boolean;
   variantOptions: VariantOption[];
   price: Price;
}

export interface Highlight {
   key?: string;
   name: string;
   icon: string;
   value: string;
}

export interface VariantOption {
   type: "color" | "storage";
   options: Option[];
}

export interface Option {
   value: string;
   label: string;
}

export interface Price {
   base: number;
   final: number;
   discountAmount: number;
   discountPercentage: number;
   hasPromotion: boolean;
}

export interface ProductResponse {
   success: boolean;
   data: Product[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
   };
   message: string;
}
