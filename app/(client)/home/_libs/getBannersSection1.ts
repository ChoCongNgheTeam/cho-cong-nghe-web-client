import apiRequest from "@/lib/api";
import { Banner } from "./getBannersTop";
import { HomeApiResponse } from "../types";

export async function getBannersSection1(): Promise<Banner[]> {
   try {
      const response = await apiRequest.get<HomeApiResponse>("/home", {
         noAuth: true,
      });
      return response.data.bannersSection1 ?? [];
   } catch (error) {
      console.error("Failed to fetch banners section 1:", error);
      return [];
   }
}
