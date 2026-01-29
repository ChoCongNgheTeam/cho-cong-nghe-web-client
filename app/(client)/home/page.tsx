// app/(client)/home/page.tsx
import MainBanner from './components/MainBanner';
// import HotProductsSection from './components/HotProductsSection';
import CategoryGrid from './components/CategoryGrid';
import HotSaleOnline from './components/HotSaleOnline';
// import LaptopSaleEvent from './components/LaptopSaleEvent';
// import FeaturedProducts from './components/FeaturedProducts';
import SeasonalSale from './components/SeasonalSale';
// import SaleProducts from './components/SaleProducts';
import TripleBanner from './components/TripleBanner';
import DoubleBanner from './components/DoubleBanner';
// import BlogSection from './components/BlogSection';
// import ViewedProducts from './components/ViewedProducts';

/**
 * Home Page - Trang chủ thương mại điện tử
 * CHỈ GHÉP CÁC COMPONENT - KHÔNG VIẾT LOGIC NẶNG
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-light">
      {/* Hero Banners */}
      <MainBanner />
      <DoubleBanner />

      {/* Browse by Category */}
      <CategoryGrid />

      {/* Flash Sale */}
      <HotSaleOnline />

      {/* More Promotions */}
      <TripleBanner />

      {/* Seasonal Deals */}
      <SeasonalSale />

      {/* Uncomment khi cần */}
      {/* <HotProductsSection /> */}
      {/* <FeaturedProducts /> */}
      {/* <BlogSection /> */}
      {/* <ViewedProducts /> */}
    </main>
  );
}