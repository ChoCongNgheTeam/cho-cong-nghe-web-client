import {
   BannersTop,
   HomeSlider,
   FeaturedCategories,
   FeaturedProducts,
   BannersSection1,
   BestSellers,
   BlogSection,
   TrustBadges,
} from "./components";
import SeasonalSale from "./components/Sales/SeasonalSale";
// import RecentlyViewed from "./components/RecentlyViewed";
import {
   getBannersSection1,
   getBannersTop,
   getBestSellingProducts,
   getBlogs,
   getFeaturedCategories,
   getFeaturedProducts,
   getHomeSliders,
} from "./_libs";
import { getSaleProducts } from "@/lib/api-demo";
import HotSaleOnline from "./components/Sales/HotSaleOnline";
export default async function HomePage() {
   const [
      sliders,
      featuredCategories,
      bannersTop,
      featuredProducts,
      hotProducts,
      bannersSection1,
      blogsData,
      saleProducts,
   ] = await Promise.all([
      getHomeSliders(),
      getFeaturedCategories(),
      getBannersTop(),
      getFeaturedProducts(),
      getBestSellingProducts(),
      getBannersSection1(),
      getBlogs(),
      getSaleProducts(),
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
         <HotSaleOnline products={saleProducts} />

         {/* Featured Products */}
         <FeaturedProducts products={featuredProducts} />

         {/* Best Sellers */}
         <BestSellers products={hotProducts} />

         {/* Seasonal Sale */}
         <SeasonalSale />

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
