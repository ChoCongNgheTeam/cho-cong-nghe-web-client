'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ProductDTO, formatPrice } from '@/lib/api-demo';

interface HotSaleProductCardProps {
  product: ProductDTO;
  index?: number;
}

export default function HotSaleProductCard({ product, index = 0 }: HotSaleProductCardProps) {
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;

  return (
    <Link
      href={`/products/${product.product.id}`}
      className="group relative flex flex-col bg-white hover:shadow-lg transition-all duration-300"
      style={{
        animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      {/* Top Section: Image + Features */}
      <div className="grid grid-cols-[120px_1fr] gap-3 p-3">
        {/* Left: Product Image with Sale Badge */}
        <div className="relative w-[120px] h-[120px] bg-white flex-shrink-0">
          {/* Sale Badge - On top of image */}
          <div className="absolute -top-1 -left-1 z-10">
            <div className="relative w-10 h-10">
              {/* Star Badge SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <path
                  d="M50,10 L55,35 L75,25 L65,45 L90,50 L65,55 L75,75 L55,65 L50,90 L45,65 L25,75 L35,55 L10,50 L35,45 L25,25 L45,35 Z"
                  fill="#DC2626"
                />
              </svg>
              {/* Sale Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-[9px] font-black">Sale</span>
              </div>
            </div>
          </div>

          {product.mainImage && (
            <Image
              src={product.mainImage.imagePath}
              alt={product.mainImage.altText}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105 p-2"
              sizes="120px"
            />
          )}
        </div>

        {/* Right: Features List */}
        <div className="flex flex-col justify-center space-y-1.5">
          <div className="flex items-start gap-1.5">
            <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-neutral-dark-hover" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-primary leading-tight">Độ phân giải 3MP</span>
          </div>
          <div className="flex items-start gap-1.5">
            <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-neutral-dark-hover" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-primary leading-tight">Độ phân giải 3MP</span>
          </div>
          <div className="flex items-start gap-1.5">
            <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-neutral-dark-hover" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-primary leading-tight">Độ phân giải 3MP</span>
          </div>
        </div>
      </div>

      {/* Stock Status Badge */}
      <div className="px-3 pb-2">
        <div className="bg-promotion-light text-promotion text-xs font-bold px-3 py-1 rounded inline-block">
          Còn 9/10 sản phẩm
        </div>
      </div>

      {/* Product Info */}
      <div className="px-3 pb-3">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-primary mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-promotion transition-colors">
          {product.product.name}
        </h3>

        {/* Prices */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-primary">
              {formatPrice(product.sale_price)}
            </span>
          </div>
          
          {hasDiscount && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-dark line-through">
                {formatPrice(product.original_price)}
              </span>
              <span className="text-sm font-bold text-promotion">
                -{product.discount_percentage}%
              </span>
            </div>
          )}
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