import {
   BannersTop,
   HomeSlider,
   FeaturedCategories,
   FeaturedProducts,
   BannersSection1,
   BestSellers,
   BlogSection,
   TrustBadges,
   HotSaleOnline,
   SeasonalSale,
} from "./components";
// import RecentlyViewed from "./components/RecentlyViewed";
import {
   getActiveCampaigns,
   getBannersSection1,
   getBannersTop,
   getBestSellingProducts,
   getBlogs,
   getFeaturedCategories,
   getFeaturedProducts,
   getFlashSaleProducts,
   getHomeSliders,
} from "./_libs";
export default async function HomePage() {
   const [
      sliders,
      featuredCategories,
      bannersTop,
      flashSaleProducts,
      featuredProducts,
      hotProducts,
      activeCampaigns,
      bannersSection1,
      blogsData,
   ] = await Promise.all([
      getHomeSliders(),
      getFeaturedCategories(),
      getBannersTop(),
      getFlashSaleProducts(),
      getFeaturedProducts(),
      getBestSellingProducts(),
      getActiveCampaigns(),
      getBannersSection1(),
      getBlogs(),
   ]);
   console.log(bannersTop);
   return (
      <main className="min-h-screen bg-neutral-light">
         {/* Main Hero Banner */}
         <HomeSlider sliders={sliders} />

         {/* Double Banner (ngay sau MainBanner) */}
         <BannersTop bannersTop={bannersTop} />

         {/* Category Grid */}
         <FeaturedCategories featuredCategories={featuredCategories} />

         {/* Hot Sale Online */}
         <HotSaleOnline flashSale={flashSaleProducts} />

         {/* Featured Products */}
         <FeaturedProducts products={featuredProducts} />

         {/* Best Sellers */}
         <BestSellers products={hotProducts} />

         {/* Seasonal Sale */}
         <SeasonalSale campaigns={activeCampaigns} />

         {/* Triple Banners */}
         <BannersSection1 banners={bannersSection1} />

         {/* Blog Section */}
         <BlogSection blogs={blogsData.data} />

         {/* Recently Viewed */}
         {/* <RecentlyViewed products={featuredProducts.slice(0, 6)} /> */}

         {/* Trust Badges Section */}
         <TrustBadges />
      </main>
   );
}
