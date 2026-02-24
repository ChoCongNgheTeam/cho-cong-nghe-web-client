import apiRequest from "@/lib/api";
import { FeaturedProduct } from "./getFeaturedProducts";
import { HomeApiResponse } from "../types";

export interface FlashSaleData {
   products: FeaturedProduct[];
   total: number;
   date: string;
   startDate: string | null;
   endDate: string | null;
}

export async function getFlashSaleProducts(): Promise<FlashSaleData> {
   try {
      const response = await apiRequest.get<HomeApiResponse>("/home", {
         noAuth: true,
      });
      return response.data.flashSaleProducts;
   } catch (error) {
      console.error("Failed to fetch flash sale products:", error);
      return {
         products: [],
         total: 0,
         date: "",
         startDate: null,
         endDate: null,
      };
   }
}
