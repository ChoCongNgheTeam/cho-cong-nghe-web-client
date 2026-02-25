import apiRequest from "@/lib/api";
import { HomeApiResponse } from "../types";

export interface Slider {
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

export async function getHomeSliders(): Promise<Slider[]> {
   try {
      const response = await apiRequest.get<HomeApiResponse>("/home", {
         noAuth: true,
      });
      return response.data.sliders ?? [];
   } catch (error) {
      console.error("Failed to fetch home sliders:", error);
      return [];
   }
}
