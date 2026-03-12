"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import WishlistHeart from "@/components/shared/WishlistHeart";
import { HighlightIcon } from "@/(client)/home/common/HighlightIcon";
import { Product } from "./types";
import Badge from "../ui/Badge";

interface ProductCardProps {
   product: Product;
   index?: number;
}

const STAR_COUNT = 5;

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
   const hasPromotion = product.price?.hasPromotion ?? false;
   const discountPercentage = product.price?.discountPercentage ?? 0;
   const hasHighlights = (product.highlights ?? []).length > 0;

   return (
      <Link
         href={`/products/${product.slug}`}
         className="group relative flex flex-col bg-neutral-light border border-neutral rounded-xl py-6 px-3"
      >
         <WishlistHeart productId={product.id} />

         {hasPromotion && (
            <Badge
               discountPercent={discountPercentage}
               className="-top-3 -left-3"
            />
         )}

         <div className="flex flex-row items-center pb-3 mt-4 h-40">
            <div className="relative shrink-0 w-40 h-40">
               {product.thumbnail ? (
                  <Image
                     src={product.thumbnail}
                     alt={product.name}
                     fill
                     className="object-contain transition-transform duration-500 group-hover:scale-105"
                     sizes="160px"
                  />
               ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-neutral-dark bg-neutral rounded-lg">
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10 opacity-40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={1.5}
                           d="M3 7h2l2-3h10l2 3h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z"
                        />
                        <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
                     </svg>
                     <span className="text-[10px] opacity-50">No image</span>
                  </div>
               )}
            </div>

            {/* Highlights — chỉ render khi có data */}
            {hasHighlights && (
               <div className="flex flex-col justify-around h-full flex-1 pl-1">
                  {(product.highlights ?? []).map((highlight) => (
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
            )}
         </div>

         {/* Product Info */}
         <div className="px-4">
            <h3 className="text-sm font-medium text-primary mb-1 line-clamp-2 min-h-10 transition-colors">
               {product.name}
            </h3>

            {/* Prices */}
            <div className="flex flex-col gap-0.5 mb-2">
               {hasPromotion ? (
                  <>
                     <span className="text-lg font-bold text-promotion leading-tight truncate">
                        {product.price.final.toLocaleString("vi-VN")}₫
                     </span>
                     <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[13px] text-neutral-dark line-through">
                           {product.price.base.toLocaleString("vi-VN")}₫
                        </span>
                     </div>
                  </>
               ) : (
                  <span className="text-lg font-bold text-primary leading-tight truncate">
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
