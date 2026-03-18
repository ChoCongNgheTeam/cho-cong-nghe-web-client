export { getHomeSliders } from "./getMainBanners";
export type { Slider } from "./getMainBanners";

export { getFeaturedCategories } from "./getFeaturedCategories";
export type { FeaturedCategory } from "./getFeaturedCategories";

export { getBannersTop } from "./getBannersTop";
export { getBannersSection1 } from "./getBannersSection1";
export type { Banner } from "./getBannersTop";

export { getFeaturedProducts } from "./getFeaturedProducts";
export { getBestSellingProducts } from "./getBestSellingProducts";

// getFlashSaleProducts giữ lại để không break nơi khác đang dùng
export { getFlashSaleProducts } from "./getFlashSaleProducts";
export type { FlashSaleData } from "./getFlashSaleProducts";

// getSaleSchedule — dùng cho HotSaleOnline (thay thế getFlashSaleProducts trong page.tsx)
export { getSaleSchedule } from "./getSaleSchedule";
export type { SaleScheduleData, SaleScheduleDay, SaleSchedulePromotion, SaleScheduleRule, SaleProduct } from "./getSaleSchedule";

export type { FeaturedProduct, ProductPrice, ProductRating, ProductHighlight } from "./getFeaturedProducts";

export { getBlogs } from "./getBlogs";
export type { Blog, BlogAuthor, BlogPagination } from "./getBlogs";

export { getActiveCampaigns } from "./getActiveCampaigns";
export type { Campaign, CampaignCategory } from "./getActiveCampaigns";
