import apiRequest from "@/lib/api";
import { HomeApiResponse } from "../types";

export interface Banner {
   id: string;
   type: string;
   position: string;
   title: string;
   imageUrl: string | null;
   linkUrl: string | null;
   order: number;
   isActive: boolean;
   createdAt: string;
   updatedAt: string;
}

export async function getBannersTop(): Promise<Banner[]> {
   try {
      const response = await apiRequest.get<HomeApiResponse>("/home", {
         noAuth: true,
      });
      return response.data.bannersTop ?? [];
   } catch (error) {
      console.error("Failed to fetch banners top:", error);
      return [];
   }
}
