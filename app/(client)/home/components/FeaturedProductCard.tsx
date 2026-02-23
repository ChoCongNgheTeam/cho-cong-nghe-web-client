"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Package } from "lucide-react";
import { ProductDTO, formatPrice } from "@/lib/api-demo";

interface FeaturedProductCardProps {
   product: ProductDTO;
   index?: number;
}

const STAR_COUNT = 5;
const MOCK_RATING = 3;
const MOCK_REVIEW_COUNT = 10;

const MOCK_FEATURES = [
   { label: "Độ phân giải", value: "3MP" },
   { label: "Góc nhìn", value: "180°" },
   { label: "Hồng ngoại", value: "30m" },
];

export default function FeaturedProductCard({
   product,
   index = 0,
}: FeaturedProductCardProps) {
   const discountPercentage = product?.discount_percentage ?? 0;
   const hasDiscount = discountPercentage > 0;

   return (
      <Link
         href={`/products/${product.product.id}`}
         className="group relative flex flex-col bg-white py-6 px-3"
      >
         {hasDiscount && (
            <div className="absolute -top-3 -left-3 z-20">
               <div className="relative w-14 h-14">
                  <svg
                     viewBox="0 0 100 100"
                     className="w-full h-full drop-shadow-lg"
                  >
                     <path
                        d="M50,10 L55,35 L75,25 L65,45 L90,50 L65,55 L75,75 L55,65 L50,90 L45,65 L25,75 L35,55 L10,50 L35,45 L25,25 L45,35 Z"
                        fill="#DC2626"
                     />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-white text-[10px] font-black leading-none">
                        {discountPercentage}%
                     </span>
                  </div>
               </div>
            </div>
         )}

         <div className="grid grid-cols-[1.5fr_1fr] items-center pb-3">
            {/* Image */}
            <div className="relative w-full aspect-square bg-white">
               {product?.mainImage && (
                  <Image
                     src={product.mainImage.imagePath}
                     alt={product.mainImage.altText || product.product.name}
                     fill
                     className="object-contain transition-transform duration-500 group-hover:scale-105"
                     sizes="250px"
                  />
               )}
            </div>

            {/* Features */}
            <div className="flex flex-col justify-between h-full">
               {MOCK_FEATURES.map((feature) => (
                  <div
                     key={feature.label}
                     className="flex flex-col items-center gap-1"
                  >
                     <Package className="w-6 h-6 text-neutral-dark-hover opacity-30" />
                     <span className="text-[10px] text-primary text-center leading-tight">
                        {feature.label}
                        <br />
                        {feature.value}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         {/* Product Info */}
         <div className="px-4">
            <h3 className="text-sm font-medium text-primary mb-3 line-clamp-2 min-h-10 transition-colors">
               {product.product.name}
            </h3>

            {/* Prices */}
            <div className="flex items-baseline gap-3 mb-2">
               <span className="text-xl font-bold text-promotion">
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
               <div className="flex items-center gap-0.5">
                  {Array.from({ length: STAR_COUNT }).map((_, i) => (
                     <Star
                        key={i}
                        className="w-4 h-4"
                        fill={i < MOCK_RATING ? "#facc15" : "#d1d5db"}
                        stroke="none"
                     />
                  ))}
               </div>
               <span className="text-xs text-neutral-dark">
                  ({MOCK_REVIEW_COUNT})
               </span>
            </div>
         </div>
      </Link>
   );
}
