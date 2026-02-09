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
      {/* Sale Badge - Outside/Above the card */}
      <div className="absolute -top-3 -left-3 z-20">
        <div className="relative w-14 h-14">
          {/* Star Badge SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            <path
              d="M50,10 L55,35 L75,25 L65,45 L90,50 L65,55 L75,75 L55,65 L50,90 L45,65 L25,75 L35,55 L10,50 L35,45 L25,25 L45,35 Z"
              fill="#DC2626"
            />
          </svg>
          {/* Sale Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-black">Sale</span>
          </div>
        </div>
      </div>

      {/* Top Section: Image + Features in 2 columns */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-2 p-4 pt-6">
        {/* Left Column: Product Image */}
        <div className="relative w-full aspect-square bg-white flex-shrink-0">
          {product.mainImage && (
            <Image
              src={product.mainImage.imagePath}
              alt={product.mainImage.altText}
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

      {/* Stock Status Badge */}
      <div className="px-4 pb-3">
        <div className="bg-promotion-light text-promotion text-xs font-bold px-3 py-1.5 rounded inline-block">
          Còn 9/10 sản phẩm
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 pb-4">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-primary mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-promotion transition-colors">
          {product.product.name}
        </h3>

        {/* Prices */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-primary">
              {formatPrice(product.sale_price)}
            </span>
          </div>
          
          {hasDiscount && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-dark line-through">
                {formatPrice(product.original_price)}
              </span>
              <span className="text-lg font-bold text-promotion">
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