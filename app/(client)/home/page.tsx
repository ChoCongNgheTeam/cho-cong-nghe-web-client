import { getHomePageData } from "./_libs";
import { BannersTop, HomeSlider, FeaturedCategories, FeaturedProducts, BannersSection1, BestSellers, BlogSection, TrustBadges, HotSaleOnline, SeasonalSale } from "./components";

export default async function HomePage() {
  const { sliders, featuredCategories, bannersTop, saleSchedule, featuredProducts, bestSellingProducts, activeCampaigns, bannersSection1, blogs } = await getHomePageData();

  const hasSale = saleSchedule?.todayProducts?.products.length > 0;

  console.log(hasSale);

  return (
    <main className="min-h-screen bg-neutral-light">
      <HomeSlider sliders={sliders} />
      <BannersTop bannersTop={bannersTop} />
      <FeaturedCategories featuredCategories={featuredCategories} />
      {hasSale && <HotSaleOnline saleSchedule={saleSchedule} />}
      <FeaturedProducts products={featuredProducts} />
      <BestSellers products={bestSellingProducts} />
      <BannersSection1 banners={bannersSection1} />
      <SeasonalSale campaigns={activeCampaigns} />
      <BlogSection blogs={blogs.data} />
      <TrustBadges />
    </main>
  );
}
