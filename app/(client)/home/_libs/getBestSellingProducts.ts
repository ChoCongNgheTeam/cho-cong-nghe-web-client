import apiRequest from "@/lib/api";
import { FeaturedProduct } from "./getFeaturedProducts";
import { HomeApiResponse } from "../types";

export async function getBestSellingProducts(): Promise<FeaturedProduct[]> {
   try {
      const response = await apiRequest.get<HomeApiResponse>("/home", {
         noAuth: true,
      });
      return response.data.bestSellingProducts ?? [];
   } catch (error) {
      console.error("Failed to fetch best selling products:", error);
      return [];
   }
}
