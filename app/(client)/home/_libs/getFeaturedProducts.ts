import apiRequest from "@/lib/api";
import { HomeApiResponse } from "../types";

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

export interface FeaturedProduct {
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
}


export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
   try {
      const response = await apiRequest.get<HomeApiResponse>("/home", {
         noAuth: true,
      });
      return response.data.featuredProducts ?? [];
   } catch (error) {
      console.error("Failed to fetch featured products:", error);
      return [];
   }
}
