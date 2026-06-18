import { FeaturedProduct } from "../../types";

// ─────────────────────────────────────────────────────────────────────────────
// SALE SCHEDULE
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

export interface SaleProductPricingContext {
  base: number;
  final: number;
  discountAmount: number;
  discountPercentage: number;
  hasPromotion: boolean;
  promotionName?: string;
}

export interface SaleProductCard {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
}

export interface SaleProduct {
  card: SaleProductCard;
  pricingContext: SaleProductPricingContext;
}

export interface TodayProductPromotion {
  id: string;
  name: string;
  description: string | null;
  priority: number;
}

export interface TodayProducts {
  products: FeaturedProduct[];
  total: number;
  date: string;
  startDate: string | null;
  endDate: string | null;
  promotions: TodayProductPromotion[];
}

export interface HomeSaleScheduleData {
  schedule: SaleScheduleDay[];
  todayProducts: TodayProducts;
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE
// ─────────────────────────────────────────────────────────────────────────────

export interface CachedDayData {
  products: FeaturedProduct[];
  total: number;
  promotions: TodayProductPromotion[];
  endDate: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

export interface SaleByDateApiResponse {
  data: FeaturedProduct[];
  total: number;
  promotions: TodayProductPromotion[];
  endDate: string | null;
}
