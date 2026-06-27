import apiRequest from "@/lib/api";
import { HomeApiResponse } from "./types";
import { fetchRootCategories } from "@/components/layout/Header/_libs/header";

const fetchHomeData = async (): Promise<HomeApiResponse["data"]> => {
  const response = await apiRequest.get<HomeApiResponse>("/home", {
    noAuth: true,
    // next: { revalidate: 60 },
  });
  return response.data;
};

export async function getHomePageData() {
  const [data, rootCategories] = await Promise.all([fetchHomeData(), fetchRootCategories()]);

  return {
    sliders: data.sliders ?? [],
    rootCategories,
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
