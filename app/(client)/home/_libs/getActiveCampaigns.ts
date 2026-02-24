import apiRequest from "@/lib/api";
import { HomeApiResponse } from "../types";

export interface CampaignCategory {
   id: string;
   campaignId: string;
   categoryId: string;
   position: number;
   imagePath: string;
   imageUrl: string;
   title: string;
   description: string;
   category: {
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
      imagePath: string;
   };
}

export interface Campaign {
   id: string;
   name: string;
   slug: string;
   type: string;
   description: string;
   startDate: string;
   endDate: string;
   isActive: boolean;
   createdAt: string;
   updatedAt: string;
   categories: CampaignCategory[];
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
   try {
      const response = await apiRequest.get<HomeApiResponse>("/home", {
         noAuth: true,
      });
      return response.data.activeCampaigns ?? [];
   } catch (error) {
      console.error("Failed to fetch active campaigns:", error);
      return [];
   }
}
