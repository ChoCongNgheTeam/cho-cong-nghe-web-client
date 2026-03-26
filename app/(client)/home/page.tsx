import { getHomePageData } from "./_libs";
import { BannersTop, HomeSlider, FeaturedCategories, FeaturedProducts, BannersSection1, BestSellers, BlogSection, TrustBadges, HotSaleOnline, SeasonalSale } from "./components";

export default async function HomePage() {
  const { sliders, featuredCategories, bannersTop, saleSchedule, featuredProducts, bestSellingProducts, activeCampaigns, bannersSection1, blogs } = await getHomePageData();
  //   console.log("categories:", featuredCategories);
  return (
    <main className="min-h-screen bg-neutral-light">
      <HomeSlider sliders={sliders} />
      <BannersTop bannersTop={bannersTop} />
      <FeaturedCategories featuredCategories={featuredCategories} />
      <HotSaleOnline saleSchedule={saleSchedule ?? { schedule: [] }} />
      <FeaturedProducts products={featuredProducts} />
      <BestSellers products={bestSellingProducts} />
      <SeasonalSale campaigns={activeCampaigns} />
      <BannersSection1 banners={bannersSection1} />
      <BlogSection blogs={blogs.data} />
      <TrustBadges />
    </main>
  );
}
