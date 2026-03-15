// types/wishlist.ts
export interface WishlistItem {
   id: string;
   userId: string;
   productId: string;
   createdAt: string;
   product: {
      id: string;
      name: string;
      slug: string;
      isActive: boolean;
      brandId: string;
      ratingAverage: string;
      ratingCount: number;
      category: {
         id: string;
         parent: {
            id: string;
            parent: { id: string };
         };
      };
      variants: { id: string; price: string }[];
      productSpecifications: {
         value: string;
         specification: { name: string; unit: string | null };
      }[];
      img: {
         id: string;
         imageUrl: string | null;
         color: string;
         altText: string;
         position: number;
      }[];
   };
   price: {
      base: number;
      final: number;
      discountAmount: number;
      discountPercentage: number;
      hasPromotion: boolean;
   };
}

export interface WishlistMeta {
   total: number;
   page: number;
   limit: number;
   totalPages: number;
}

export interface WishlistResponse {
   data: WishlistItem[];
   meta: WishlistMeta;
   message: string;
}
