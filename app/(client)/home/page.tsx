import { getHomePageData } from "./_lib/home.api";
import { HomeSliderSection, TopBanners, FeaturedCategories, FeaturedProducts, MiddleBanners, BestSellers, BlogSection, TrustBadges, HotSaleOnline, SeasonalSale, HeroBanner } from "./_components";
import { CategoryProducts } from "./_components/products/CategoryProducts";

export default async function HomePage() {
  const { bannersDeal, sliders, rootCategories, featuredCategories, bannersTop, bannersSection1, saleSchedule, featuredProducts, bestSellingProducts, categoryProducts, activeCampaigns, blogs } =
    await getHomePageData();

  const hasSale = (saleSchedule?.todayProducts?.products.length ?? 0) > 0;

  return (
    <main className="min-h-screen bg-neutral-light">
      <HomeSliderSection sliders={sliders} categories={rootCategories} bannersDeal={bannersDeal} />
      {hasSale && <HotSaleOnline saleSchedule={saleSchedule} />}
      <TopBanners topBanner={bannersTop} />
      <FeaturedCategories featuredCategories={featuredCategories} />
      <FeaturedProducts products={featuredProducts} />
      <HeroBanner />
      <BestSellers products={bestSellingProducts} />
      <CategoryProducts groups={categoryProducts} />
      <MiddleBanners middleBanner={bannersSection1} />
      <SeasonalSale campaigns={activeCampaigns} />
      <BlogSection blogs={blogs.data} />
      <TrustBadges />
    </main>
  );
}
