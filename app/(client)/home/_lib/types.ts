import { Category } from "@/(client)/category/_lib";
import { Blog } from "../../blog/_lib/blog.type";

// ============================================================
// Slider & Banner
// ============================================================
export interface Slider {
  id: string;
  type: string;
  position: string;
  title: string | null;
  subTitle: string | null;
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
  title: string | null;
  subTitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Category
// ============================================================
export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  position: number;
}

// ============================================================
// Product
// ============================================================
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

export interface ProductCategory {
  id: string;
  slug: string;
  parent?: {
    id: string;
    slug: string;
    name: string;
    parent?: {
      id: string;
      slug: string;
    };
  };
}

export interface FeaturedProduct {
  id: string;
  name: string;
  priceOrigin: number;
  slug: string;
  variantId?: string;
  thumbnail: string | null;
  createdAt: string;
  rating: ProductRating;
  isFeatured: boolean;
  isNew: boolean;
  highlights: ProductHighlight[];
  inStock: boolean;
  isActive: boolean;
  category: ProductCategory;
  price: ProductPrice;
}

// ============================================================
// Sale & Promotion
// ============================================================
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

export interface SaleScheduleData {
  schedule: SaleScheduleDay[];
  todayProducts: TodayProducts;
}

export interface FlashSaleData {
  products: FeaturedProduct[];
  total: number;
  date: string;
  startDate: string | null;
  endDate: string | null;
}

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

export interface CachedDayData {
  products: FeaturedProduct[];
  total: number;
  promotions: TodayProductPromotion[];
  endDate: string | null;
}

export interface SaleByDateApiResponse {
  data: FeaturedProduct[];
  total: number;
  promotions: TodayProductPromotion[];
  endDate: string | null;
}

// ============================================================
// Campaign
// ============================================================
export interface CampaignCategory {
  id: string;
  campaignId: string;
  categoryId: string;
  position: number;
  imagePath: string;
  imageUrl: string | null;
  title: string | null;
  description: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    imagePath: string | null;
  };
}

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categories: CampaignCategory[];
}

// ============================================================
// Blog
// ============================================================
export interface BlogPagination {
  data: Blog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================
// Home API
// ============================================================
export interface HomeApiResponse {
  data: {
    sliders: Slider[];
    categories: Category[];
    featuredCategories: FeaturedCategory[];
    bannersTop: Banner[];
    flashSaleProducts: FlashSaleData;
    saleSchedule: SaleScheduleData;
    featuredProducts: FeaturedProduct[];
    bannersSection1: Banner[];
    bestSellingProducts: FeaturedProduct[];
    activeCampaigns: Campaign[];
    blogs: BlogPagination;
  };
}
