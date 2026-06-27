import { getHomePageData } from "./_lib";
import { HomeSliderSection, TopBanners, FeaturedCategories, FeaturedProducts, MiddleBanners, BestSellers, BlogSection, TrustBadges, HotSaleOnline, SeasonalSale } from "./components";
import { CategoryProducts } from "./components/CategoryProducts";
import { HeroBanner } from "./components/HeroBanner";

export default async function HomePage() {
  const { sliders, rootCategories, featuredCategories, bannersTop, saleSchedule, featuredProducts, bestSellingProducts, activeCampaigns, bannersSection1, blogs } = await getHomePageData();

  const hasSale = saleSchedule?.todayProducts?.products.length > 0;

  return (
    <main className="min-h-screen bg-neutral-light">
      <HomeSliderSection sliders={sliders} categories={rootCategories} />
      {hasSale && <HotSaleOnline saleSchedule={saleSchedule} />}
      <TopBanners topBanner={bannersTop} />
      <FeaturedCategories featuredCategories={featuredCategories} />
      <FeaturedProducts products={featuredProducts} />
      <HeroBanner />
      <BestSellers products={bestSellingProducts} />
      <CategoryProducts />
      <MiddleBanners middleBanner={bannersSection1} />
      <SeasonalSale campaigns={activeCampaigns} />
      <BlogSection blogs={blogs.data} />
      <TrustBadges />
    </main>
  );
}
