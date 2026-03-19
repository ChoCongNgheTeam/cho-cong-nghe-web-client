import { Banner, BlogPagination, Campaign, FeaturedCategory, FeaturedProduct, FlashSaleData, SaleScheduleData, Slider } from "./_libs";

export interface HomeApiResponse {
  data: {
    sliders: Slider[];
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
