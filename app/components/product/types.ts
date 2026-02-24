export interface ProductHighlight {
   key: string;
   name: string;
   icon: string;
   value: string;
}

export interface ProductPrice {
   base: number;
   final: number;
   discountAmount: number;
   discountPercentage: number;
   hasPromotion: boolean;
}

export interface ProductRating {
   average: number;
   count: number;
}

export interface Product {
   id: string;
   name: string;
   priceOrigin: number;
   slug: string;
   thumbnail: string;
   rating: ProductRating;
   isNew: boolean;
   highlights: ProductHighlight[];
   inStock: boolean;
   price: ProductPrice;
   isWishlist?: boolean;
}

export interface Pagination {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
}

export interface PageProps {
   params: Promise<{ slug: string }>;
   searchParams: Promise<{ page?: string }>;
}
