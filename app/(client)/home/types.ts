import {
   Banner,
   BlogPagination,
   Campaign,
   FeaturedCategory,
   FeaturedProduct,
   FlashSaleData,
   Slider,
} from "./_libs";

export interface HomeApiResponse {
   data: {
      sliders: Slider[];
      featuredCategories: FeaturedCategory[];
      bannersTop: Banner[];
      flashSaleProducts: FlashSaleData;
      featuredProducts: FeaturedProduct[];
      bannersSection1: Banner[];
      bestSellingProducts: FeaturedProduct[];
      activeCampaigns: Campaign[];
      blogs: BlogPagination;
   };
}
