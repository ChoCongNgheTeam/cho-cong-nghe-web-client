import apiRequest from "@/lib/api";
import { HomeApiResponse } from "../types";

async function fetchHomeData(): Promise<HomeApiResponse["data"]> {
  const response = await apiRequest.get<HomeApiResponse>("/home", {
    noAuth: true,
    cache: "no-store",
  });
  return response.data;
}

export async function getHomePageData() {
  const data = await fetchHomeData();
  return {
    sliders: data.sliders ?? [],
    featuredCategories: data.featuredCategories ?? [],
    bannersTop: data.bannersTop ?? [],
    bannersSection1: data.bannersSection1 ?? [],
    featuredProducts: data.featuredProducts ?? [],
    bestSellingProducts: data.bestSellingProducts ?? [],
    flashSaleProducts: data.flashSaleProducts ?? null,
    saleSchedule: data.saleSchedule ?? null,
    blogs: data.blogs ?? null,
    activeCampaigns: data.activeCampaigns ?? [],
  };
}
