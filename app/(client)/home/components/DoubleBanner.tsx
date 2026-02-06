'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  getDoubleBanners, 
  BannerDTO, 
  getHotProductsByBanner, 
  ProductDTO,
  formatPrice 
} from '@/lib/api-demo';
import { X, Star, ShoppingCart, Tag } from 'lucide-react';

export default function DoubleBanner() {
  const [banners, setBanners] = useState<BannerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [hotProducts, setHotProducts] = useState<ProductDTO[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDoubleBanners();
        setBanners(data);
      } catch (error) {
        console.error('Error loading double banners:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleBannerClick = async (e: React.MouseEvent, bannerId: string) => {
    e.preventDefault();
    setSelectedBanner(bannerId);
    setLoadingProducts(true);
    
    try {
      const response = await getHotProductsByBanner(bannerId);
      if (response.success) {
        setHotProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading hot products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const closeModal = () => {
    setSelectedBanner(null);
    setHotProducts([]);
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-[180px] md:h-[220px] bg-neutral animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <>
      <section className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <button
              key={banner.id}
              onClick={(e) => handleBannerClick(e, banner.id)}
              className="relative h-[180px] md:h-[220px] rounded-lg overflow-hidden group cursor-pointer w-full"
            >
              <Image
                src={banner.image_path}
                alt={banner.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium">Xem sản phẩm hot →</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedBanner && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <div>
                <h2 className="text-2xl font-bold">🔥 Sản Phẩm Hot Nổi Bật</h2>
                <p className="text-sm opacity-90 mt-1">Ưu đãi đặc biệt - Số lượng có hạn</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-xl h-96 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotProducts.map((item) => (
                    <Link
                      key={item.product.id}
                      href={`/product/${item.product.slug}`}
                      className="group bg-white border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <Image
                          src={item.mainImage?.imagePath || '/placeholder.jpg'}
                          alt={item.mainImage?.altText || item.product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Discount Badge */}
                        {item.discount_percentage && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            -{item.discount_percentage}%
                          </div>
                        )}
                        {/* Featured Badge */}
                        {item.product.is_featured && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            HOT
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        {/* Brand & Category */}
                        <div className="text-xs text-gray-500 mb-1">
                          {item.brand.name} • {item.category.name}
                        </div>

                        {/* Product Name */}
                        <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-red-500 transition-colors h-10">
                          {item.product.name}
                        </h3>

                        {/* Rating & Sold */}
                        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{item.product.rating_average}</span>
                            <span className="text-gray-400">({item.product.rating_count})</span>
                          </div>
                          <span>Đã bán {item.variant.sold_count}</span>
                        </div>

                        {/* Price */}
                        <div className="space-y-1 mb-3">
                          <div className="text-red-500 font-bold text-lg">
                            {formatPrice(item.sale_price)}
                          </div>
                          {item.discount_percentage && (
                            <div className="text-gray-400 text-xs line-through">
                              {formatPrice(item.original_price)}
                            </div>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="text-xs mb-3">
                          {item.variant.quantity > 0 ? (
                            <span className="text-green-600">Còn {item.variant.quantity} sản phẩm</span>
                          ) : (
                            <span className="text-red-600">Hết hàng</span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button 
                          className="w-full bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                          disabled={item.variant.quantity === 0}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {item.variant.quantity > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                        </button>

                        {/* Promotions */}
                        {item.activePromotions.length > 0 && (
                          <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            🎁 Khuyến mãi đặc biệt
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}