import { BannersTop, HomeSlider, FeaturedCategories, FeaturedProducts, BannersSection1, BestSellers, BlogSection, TrustBadges, HotSaleOnline, SeasonalSale } from "./components";
import {
  getActiveCampaigns,
  getBannersSection1,
  getBannersTop,
  getBestSellingProducts,
  getBlogs,
  getFeaturedCategories,
  getFeaturedProducts,
  getHomeSliders,
  getSaleSchedule, // ← đổi từ getFlashSaleProducts sang getSaleSchedule
} from "./_libs";

export default async function HomePage() {
  const [
    sliders,
    featuredCategories,
    bannersTop,
    saleSchedule, // ← đổi tên biến từ flashSaleProducts / saleSchedule
    featuredProducts,
    hotProducts,
    activeCampaigns,
    bannersSection1,
    blogsData,
  ] = await Promise.all([
    getHomeSliders(),
    getFeaturedCategories(),
    getBannersTop(),
    getSaleSchedule(), // ← gọi hàm mới
    getFeaturedProducts(),
    getBestSellingProducts(),
    getActiveCampaigns(),
    getBannersSection1(),
    getBlogs(),
  ]);

  return (
    <main className="min-h-screen bg-neutral-light">
      <HomeSlider sliders={sliders} />
      <BannersTop bannersTop={bannersTop} />
      <FeaturedCategories featuredCategories={featuredCategories} />

      {/* Truyền saleSchedule thay vì flashSale */}
      <HotSaleOnline saleSchedule={saleSchedule} />

      <FeaturedProducts products={featuredProducts} />
      <BestSellers products={hotProducts} />
      <SeasonalSale campaigns={activeCampaigns} />
      <BannersSection1 banners={bannersSection1} />
      <BlogSection blogs={blogsData.data} />
      <TrustBadges />
    </main>
  );
}
