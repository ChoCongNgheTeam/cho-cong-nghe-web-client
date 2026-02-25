import apiRequest from "@/lib/api";
import { HomeApiResponse } from "../types";

export interface FeaturedCategory {
   id: string;
   name: string;
   slug: string;
   imageUrl: string;
   position: number;
}

export async function getFeaturedCategories(): Promise<FeaturedCategory[]> {
   try {
      const response = await apiRequest.get<HomeApiResponse>("/home", {
         noAuth: true,
      });
      return response.data.featuredCategories ?? [];
   } catch (error) {
      console.error("Failed to fetch featured categories:", error);
      return [];
   }
}
