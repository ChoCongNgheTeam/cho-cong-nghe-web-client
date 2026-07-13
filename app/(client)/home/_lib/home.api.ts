import apiRequest from "@/lib/api";
import { fetchRootCategories } from "@/lib/api/header/header.api";
import type { ApiResponse, HomeStaticData, HomeProductsData, HomeSaleScheduleData, HomeCategoryProductsData, HomePageData, SaleByDateApiResponse } from "./types";
import { logError } from "@/lib/monitoring/log-error";

export const HOME_CACHE_TAGS = {
  STATIC: "home-static",
  PRODUCTS: "home-products",
  SALE_SCHEDULE: "sale-schedule",
  CATEGORY_PRODUCTS: "home-category-products",
} as const;

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

const fetchHomeCategoryProducts = (): Promise<ApiResponse<HomeCategoryProductsData>> =>
  apiRequest.get("/home/category-products", {
    noAuth: true,
    next: { revalidate: 300, tags: [HOME_CACHE_TAGS.CATEGORY_PRODUCTS] },
  });

export const fetchSaleByDate = (date: string, limit = 20): Promise<ApiResponse<SaleByDateApiResponse>> =>
  apiRequest.get("/home/sale-by-date", {
    noAuth: true,
    params: { date, limit },
    next: { revalidate: 60, tags: [HOME_CACHE_TAGS.SALE_SCHEDULE] },
  });

export async function getHomePageData(): Promise<HomePageData> {
  const [staticRes, productsRes, saleRes, categoryProductsRes, rootCategoriesRes] = await Promise.allSettled([
    fetchHomeStatic(),
    fetchHomeProducts(),
    fetchHomeSaleSchedule(),
    fetchHomeCategoryProducts(),
    fetchRootCategories(),
  ]);

  if (staticRes.status === "rejected") logError("getHomePageData: fetchHomeStatic failed", staticRes.reason);
  if (productsRes.status === "rejected") logError("getHomePageData: fetchHomeProducts failed", productsRes.reason);
  if (saleRes.status === "rejected") logError("getHomePageData: fetchHomeSaleSchedule failed", saleRes.reason);
  if (categoryProductsRes.status === "rejected") logError("getHomePageData: fetchHomeCategoryProducts failed", categoryProductsRes.reason);
  if (rootCategoriesRes.status === "rejected") logError("getHomePageData: fetchRootCategories failed", rootCategoriesRes.reason);

  const staticData = staticRes.status === "fulfilled" ? staticRes.value.data : undefined;
  const productsData = productsRes.status === "fulfilled" ? productsRes.value.data : undefined;
  const saleData = saleRes.status === "fulfilled" ? saleRes.value.data : undefined;
  const categoryProductsData = categoryProductsRes.status === "fulfilled" ? categoryProductsRes.value.data : undefined;
  const rootCategories = rootCategoriesRes.status === "fulfilled" ? rootCategoriesRes.value : [];

  return {
    sliders: staticData?.sliders ?? [],
    bannersTop: staticData?.bannersTop ?? [],
    bannersSection1: staticData?.bannersSection1 ?? [],
    featuredCategories: staticData?.featuredCategories ?? [],
    activeCampaigns: staticData?.activeCampaigns ?? [],
    blogs: staticData?.blogs ?? { data: [], page: 1, limit: 0, total: 0, totalPages: 0 },

    featuredProducts: productsData?.featuredProducts ?? [],
    bestSellingProducts: productsData?.bestSellingProducts ?? [],

    saleSchedule: saleData ?? {
      schedule: [],
      todayProducts: { products: [], total: 0, date: "", startDate: null, endDate: null, promotions: [] },
    },

    categoryProducts: categoryProductsData?.groups ?? [],

    rootCategories: rootCategories ?? [],
  };
}
