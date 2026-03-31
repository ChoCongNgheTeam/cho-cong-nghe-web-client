import apiRequest from "@/lib/api";
import { HomeApiResponse } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────

export interface Slider {
  id: string;
  type: string;
  position: string;
  title: string;
  subTitle: string;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  position: number;
}

export interface ProductHighlight {
  key: string;
  name: string;
  icon: string;
  value: string;
}

export interface ProductPrice {
  base: number;
  final: number;
  discountAmount: number;
  discountPercentage: number;
  hasPromotion: boolean;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  priceOrigin: number;
  slug: string;
  thumbnail: string;
  rating: ProductRating;
  isNew: boolean;
  highlights: ProductHighlight[];
  inStock: boolean;
  price: ProductPrice;
}

export interface FlashSaleData {
  products: FeaturedProduct[];
  total: number;
  date: string;
  startDate: string | null;
  endDate: string | null;
}

export interface BlogAuthor {
  id: string;
  fullName: string;
  email: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  excerpt: string;
  viewCount: number;
  status: string;
  author: BlogAuthor;
  createdAt: string;
  publishedAt: string;
}

export interface BlogPagination {
  data: Blog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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

export interface SaleScheduleRule {
  actionType: string;
  discountValue: number | null;
}

export interface SaleSchedulePromotion {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  targetsCount: number;
  rules: SaleScheduleRule[];
}

export interface SaleScheduleDay {
  date: string;
  isToday: boolean;
  hasActiveSale: boolean;
  promotions: SaleSchedulePromotion[];
}

export interface SaleProduct {
  card: any;
  pricingContext: any;
}

export interface SaleScheduleData {
  schedule: SaleScheduleDay[];
  todayProducts: {
    products: SaleProduct[];
    total: number;
    date: string;
    startDate: string | null;
    endDate: string | null;
    promotions: Array<{
      id: string;
      name: string;
      description: string | null;
      priority: number;
    }>;
  };
}

// ── Fetch ─────────────────────────────────────────────────────────────────

async function fetchHomeData(): Promise<HomeApiResponse["data"]> {
  const response = await apiRequest.get<HomeApiResponse>("/home", {
    noAuth: true,
    cache: "no-store",
  });
  return response.data;
}

// ── Single export ─────────────────────────────────────────────────────────

export async function getHomePageData() {
  const data = await fetchHomeData();
  return {
    sliders: (data.sliders ?? []) as Slider[],
    featuredCategories: (data.featuredCategories ?? []) as FeaturedCategory[],
    bannersTop: (data.bannersTop ?? []) as Banner[],
    bannersSection1: (data.bannersSection1 ?? []) as Banner[],
    featuredProducts: (data.featuredProducts ?? []) as FeaturedProduct[],
    bestSellingProducts: (data.bestSellingProducts ?? []) as FeaturedProduct[],
    flashSaleProducts: data.flashSaleProducts as FlashSaleData,
    saleSchedule: data.saleSchedule as SaleScheduleData,
    blogs: data.blogs as BlogPagination,
    activeCampaigns: (data.activeCampaigns ?? []) as Campaign[],
  };
}
