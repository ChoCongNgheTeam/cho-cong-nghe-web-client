import apiRequest from "@/lib/api";
import { fetchRootCategories } from "@/components/layout/Header/_libs/header";
import type { ApiResponse, HomeStaticData, HomeProductsData, HomeSaleScheduleData, HomePageData } from "./types";

// ============================================================
// Cache tags — phải khớp với CACHE_TAGS trong BE home.constants.ts
// ============================================================

export const HOME_CACHE_TAGS = {
  STATIC: "home-static",
  PRODUCTS: "home-products",
  SALE_SCHEDULE: "sale-schedule",
} as const;

// ============================================================
// Fetchers
// ============================================================

const fetchHomeStatic = (): Promise<ApiResponse<HomeStaticData>> =>
  apiRequest.get("/home/static", {
    noAuth: true,
    next: { revalidate: 3600, tags: [HOME_CACHE_TAGS.STATIC] },
  });

const fetchHomeProducts = (): Promise<ApiResponse<HomeProductsData>> =>
  apiRequest.get("/home/products", {
    noAuth: true,
    next: { revalidate: 300, tags: [HOME_CACHE_TAGS.PRODUCTS] },
  });

const fetchHomeSaleSchedule = (): Promise<ApiResponse<HomeSaleScheduleData>> =>
  apiRequest.get("/home/sale-schedule", {
    noAuth: true,
    next: { revalidate: 60, tags: [HOME_CACHE_TAGS.SALE_SCHEDULE] },
  });

// ============================================================
// Main
// ============================================================

export async function getHomePageData(): Promise<HomePageData> {
  const [staticRes, productsRes, saleRes, rootCategories] = await Promise.all([fetchHomeStatic(), fetchHomeProducts(), fetchHomeSaleSchedule(), fetchRootCategories()]);

  return {
    sliders: staticRes.data.sliders ?? [],
    bannersTop: staticRes.data.bannersTop ?? [],
    bannersSection1: staticRes.data.bannersSection1 ?? [],
    featuredCategories: staticRes.data.featuredCategories ?? [],
    activeCampaigns: staticRes.data.activeCampaigns ?? [],
    blogs: staticRes.data.blogs,

    featuredProducts: productsRes.data.featuredProducts ?? [],
    bestSellingProducts: productsRes.data.bestSellingProducts ?? [],

    saleSchedule: saleRes.data,

    rootCategories: rootCategories ?? [],
  };
}
