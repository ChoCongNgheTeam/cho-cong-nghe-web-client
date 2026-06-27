import apiRequest from "@/lib/api";
import { HomeApiResponse } from "./types";

const fetchHomeData = async (): Promise<HomeApiResponse["data"]> => {
  const response = await apiRequest.get<HomeApiResponse>("/home", {
    noAuth: true,
    // next: {
    //   revalidate: 60,
    // },
  });
  return response.data;
};

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
