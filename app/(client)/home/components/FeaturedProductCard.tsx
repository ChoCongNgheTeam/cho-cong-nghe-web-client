'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ProductDTO, formatPrice } from '@/lib/api-demo';

interface FeaturedProductCardProps {
  product: ProductDTO;
  index?: number;
}

export default function FeaturedProductCard({ product, index = 0 }: FeaturedProductCardProps) {
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const installmentPrice = Math.round(product.sale_price / 3);

  // Star rating component
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating) ? 'text-yellow-400' : 'text-neutral'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-xs font-semibold text-primary-light ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <Link
      href={`/products/${product.product.id}`}
      className="group relative flex flex-col bg-neutral-light rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-neutral-light-active hover:border-red-300"
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.08}s both`,
      }}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {hasDiscount && (
          <div className="bg-promotion text-neutral-light text-xs font-black px-2.5 py-1 rounded-lg shadow-lg">
            -{product.discount_percentage}%
          </div>
        )}
      </div>

      {/* Product Image */}
      <div className="relative aspect-square bg-gradient-to-br from-neutral-light via-white to-neutral-light overflow-hidden">
        {product.mainImage && (
          <Image
            src={product.mainImage.imagePath}
            alt={product.mainImage.altText}
            fill
            className="object-contain p-6 transition-all duration-700 group-hover:scale-105 group-hover:rotate-1"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
        
        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-neutral-light/80 backdrop-blur-sm shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-promotion-light hover:scale-110"
          onClick={(e) => {
            e.preventDefault();
            // Add to wishlist logic
          }}
        >
          <svg
            className="w-5 h-5 text-primary-light-hover hover:text-promotion transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Product Info */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Category/Brand */}
        <p className="text-xs text-neutral-dark mb-1">
          {product.brand.name}
        </p>

        {/* Product Name */}
        <h3 className="text-sm md:text-base font-semibold text-primary mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-promotion transition-colors">
          {product.product.name}
        </h3>

        {/* Rating */}
        <div className="mb-3">
          <StarRating rating={product.product.rating_average} />
        </div>

        {/* Installment Tags */}R
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs text-primary-light-hover bg-neutral-light px-2 py-1 rounded border border-neutral-hover">
            Đổ phần giải 3MP
          </span>
          <span className="text-xs text-primary-light-hover bg-neutral-light px-2 py-1 rounded border border-neutral-hover">
            Đổ phần giải 3MP
          </span>
        </div>

        {/* Prices */}
        <div className="mt-auto space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg md:text-xl font-black text-promotion">
              {formatPrice(product.sale_price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-dark-hover line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Additional Info */}
          <div className="flex items-center gap-3 pt-2 border-t border-neutral-light-active">
            <div className="flex items-center gap-1 text-xs text-primary-light-hover">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>{product.product.views_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary-light-hover">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span>{product.variant.sold_count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-promotion rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Link>
  );
}