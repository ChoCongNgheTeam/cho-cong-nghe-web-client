"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import WishlistHeart from "@/components/shared/WishlistHeart";
import { HighlightIcon } from "@/(client)/home/common/HighlightIcon";
import { Product } from "./types";

interface ProductCardProps {
   product: Product;
   index?: number;
}

const STAR_COUNT = 5;

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
   const discountPercentage = product.price.discountPercentage ?? 0;
   const hasDiscount = discountPercentage > 0;

   return (
      <Link
         href={`/products/${product.slug}`}
         className="group relative flex flex-col bg-neutral-light border border-neutral rounded-xl py-6 px-3"
      >
         <WishlistHeart
            productId={product.id}
            defaultLiked={product.isWishlist ?? false}
         />
         {hasDiscount && (
            <div className="absolute -top-3 -left-3 z-20">
               <div className="relative w-14 h-14">
                  <svg
                     viewBox="0 0 100 100"
                     className="w-full h-full drop-shadow-lg"
                  >
                     <path
                        d="M50,10 L55,35 L75,25 L65,45 L90,50 L65,55 L75,75 L55,65 L50,90 L45,65 L25,75 L35,55 L10,50 L35,45 L25,25 L45,35 Z"
                        fill="rgb(var(--promotion))"
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
            <div className="relative w-full aspect-square bg-neutral-light">
               <Image
                  src={
                     product.thumbnail ||
                     "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/2024_5_13_638512191465947037_chuot-gaming-co-day-rapoo-v16s-dd.jpg"
                  }
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="250px"
               />
            </div>

            {/* Highlights */}
            <div className="flex flex-col justify-between h-full">
               {product.highlights.map((highlight) => (
                  <div
                     key={highlight.key}
                     className="flex flex-col items-center gap-1"
                  >
                     <HighlightIcon icon={highlight.icon} />
                     <span className="text-[10px] text-primary text-center leading-tight">
                        {highlight.name}
                        <br />
                        {highlight.value}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         {/* Product Info */}
         <div className="px-4">
            <h3 className="text-sm font-medium text-primary mb-3 line-clamp-2 min-h-10 transition-colors">
               {product.name}
            </h3>

            {/* Prices */}
            <div className="flex items-baseline gap-3 mb-2">
               <span className="text-xl font-bold text-promotion">
                  {product.price.final.toLocaleString("vi-VN")}₫
               </span>
               {hasDiscount && (
                  <span className="text-sm text-neutral-dark line-through">
                     {product.price.base.toLocaleString("vi-VN")}₫
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
                        fill={
                           i < Math.round(product.rating.average)
                              ? "rgb(var(--accent))"
                              : "rgb(var(--neutral))"
                        }
                        stroke="none"
                     />
                  ))}
               </div>
               <span className="text-xs text-neutral-dark">
                  ({product.rating.count})
               </span>
            </div>
         </div>
      </Link>
   );
}
