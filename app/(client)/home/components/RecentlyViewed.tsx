'use client';

import { ProductDTO } from '@/lib/api-demo';
import FeaturedProductCard from './FeaturedProductCard';

interface RecentlyViewedProps {
  products: ProductDTO[];
}

export default function RecentlyViewed({ products }: RecentlyViewedProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-neutral-light to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-primary tracking-tight mb-2">
              Sản phẩm đã xem
            </h2>
            <p className="text-primary-light-hover">Lịch sử xem sản phẩm của bạn</p>
          </div>
          
          <button className="hidden md:flex items-center gap-2 text-promotion font-bold hover:gap-3 transition-all duration-300 group">
            <span>Xóa lịch sử</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Products Horizontal Scroll */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
            {products.map((product, index) => (
              <div
                key={product.product.id}
                className="flex-shrink-0 w-64 snap-start"
                style={{
                  animation: `slideInLeft 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <FeaturedProductCard product={product} index={index} />
              </div>
            ))}
          </div>

          {/* Gradient Fade on edges */}
          <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-neutral-light to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}