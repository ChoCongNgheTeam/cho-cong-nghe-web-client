// types/wishlist.ts
import { Product } from "@/components/product/types";

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
      categoryId: string;
      ratingAverage: string;
      ratingCount: number;
      img: {
         id: string;
         imageUrl: string | null;
         color: string;
         altText: string;
         position: number;
      }[];
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

export type { Product as WishlistProduct };
