import {
   Banner,
   BlogPagination,
   FeaturedCategory,
   FeaturedProduct,
   Slider,
} from "./_libs";

export interface HomeApiResponse {
   data: {
      sliders: Slider[];
      featuredCategories: FeaturedCategory[];
      bannersTop: Banner[];
      featuredProducts: FeaturedProduct[];
      bannersSection1: Banner[];
      bestSellingProducts: FeaturedProduct[];
      blogs: BlogPagination;
   };
}
