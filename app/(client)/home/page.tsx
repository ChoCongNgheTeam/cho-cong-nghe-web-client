import {
  getMainBanners,
  getDoubleBanners,
  getTripleBanners,
  getCategories,
  getFeaturedProducts,
  getHotProducts,
  getSaleProducts,
  getBlogs,
} from '@/lib/api-demo';

import MainBanner from './components/MainBanner';
import CategoryGrid from './components/CategoryGrid';
import DoubleBanner from './components/DoubleBanner';
import TripleBanner from './components/TripleBanner';
import HotSaleOnline from './components/HotSaleOnline';
import FeaturedProducts from './components/FeaturedProducts';
import BestSellers from './components/BestSellers';
import SeasonalSale from './components/SeasonalSale';
import BlogSection from './components/BlogSection';
import RecentlyViewed from './components/RecentlyViewed';

export default async function HomePage() {
  const [
    mainBanners,
    doubleBanners,
    tripleBanners,
    categories,
    featuredProducts,
    hotProducts,
    saleProducts,
    blogs,
  ] = await Promise.all([
    getMainBanners(),
    getDoubleBanners(),
    getTripleBanners(),
    getCategories(),
    getFeaturedProducts(),
    getHotProducts(),
    getSaleProducts(),
    getBlogs(),
  ]);

  return (
    <main className="min-h-screen bg-neutral-light">
      {/* Main Hero Banner */}
      <MainBanner banners={mainBanners} />

      {/* Double Banner (ngay sau MainBanner) */}
      <DoubleBanner banners={doubleBanners} />

      {/* Category Grid */}
      <CategoryGrid categories={categories} />

      {/* Hot Sale Online */}
      <HotSaleOnline products={saleProducts} />

      {/* Featured Products */}
      <FeaturedProducts products={featuredProducts} />

      {/* Best Sellers */}
      <BestSellers products={hotProducts} />

      {/* Seasonal Sale */}
      <SeasonalSale />

      {/* Triple Banners */}
      <TripleBanner banners={tripleBanners} />

      {/* Blog Section */}
      <BlogSection blogs={blogs} />

      {/* Recently Viewed */}
      <RecentlyViewed products={featuredProducts.slice(0, 6)} />




      {/* Trust Badges Section */}
      <section className="py-12 bg-neutral-light">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Authentic Products */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-promotion-light-hover rounded-full flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-promotion" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-primary mb-2">Thương hiệu đảm bảo</h3>
              <p className="text-sm text-primary-light-hover">Nhập khẩu, bảo hành chính hãng</p>
            </div>

            {/* Easy Returns */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-accent-light-hover rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-primary mb-2">Đổi trả dễ dàng</h3>
              <p className="text-sm text-primary-light-hover">Theo chính sách đổi trả tại ChoCongNghe</p>
            </div>

            {/* Fast Delivery */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
              <h3 className="font-bold text-primary mb-2">Giao hàng tận nơi</h3>
              <p className="text-sm text-primary-light-hover">Trên toàn quốc</p>
            </div>

            {/* Quality Products */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="font-bold text-primary mb-2">Sản phẩm chất lượng</h3>
              <p className="text-sm text-primary-light-hover">Đảm bảo tương thích và độ bền cao</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}