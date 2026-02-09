'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ProductDTO, formatPrice } from '@/lib/api-demo';

interface FeaturedProductCardProps {
  product: ProductDTO;
  index?: number;
}

export default function FeaturedProductCard({ product, index = 0 }: FeaturedProductCardProps) {
  // Safely check for discount
  const discountPercentage = product?.discount_percentage ?? 0;
  const hasDiscount = discountPercentage > 0;

  return (
    <Link
      href={`/products/${product.product.id}`}
      className="group relative flex flex-col bg-white hover:shadow-lg transition-all duration-300"
      style={{
        animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      {/* Discount Badge - Outside/Above the card */}
      {hasDiscount && (
        <div className="absolute -top-3 -left-3 z-20">
          <div className="relative w-14 h-14">
            {/* Star Badge SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              <path
                d="M50,10 L55,35 L75,25 L65,45 L90,50 L65,55 L75,75 L55,65 L50,90 L45,65 L25,75 L35,55 L10,50 L35,45 L25,25 L45,35 Z"
                fill="#DC2626"
              />
            </svg>
            {/* Discount Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-[10px] font-black leading-none">
                {discountPercentage}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Section: Image + Features in 2 columns */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-2 p-4 pt-6">
        {/* Left Column: Product Image */}
        <div className="relative w-full aspect-square bg-white flex-shrink-0">
          {product?.mainImage && (
            <Image
              src={product.mainImage.imagePath}
              alt={product.mainImage.altText || product.product.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105 p-2"
              sizes="250px"
            />
          )}
        </div>

        {/* Right Column: Features List - Same height as image */}
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col items-center gap-1">
            <svg className="w-6 h-6 text-neutral-dark-hover opacity-30" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] text-primary text-center leading-tight">Độ phân giải<br/>3MP</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-6 h-6 text-neutral-dark-hover opacity-30" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] text-primary text-center leading-tight">Độ phân giải<br/>3MP</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-6 h-6 text-neutral-dark-hover opacity-30" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] text-primary text-center leading-tight">Độ phân giải<br/>3MP</span>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 pb-4">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-primary mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-promotion transition-colors">
          {product.product.name}
        </h3>

        {/* Prices */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-2xl font-black text-promotion">
            {formatPrice(product.sale_price)}
          </span>
          
          {hasDiscount && product.original_price && (
            <span className="text-sm text-neutral-dark line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {/* Stars */}
          <div className="flex items-center gap-0.5">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          {/* Review Count */}
          <span className="text-xs text-neutral-dark">(10)</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
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