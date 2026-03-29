"use client";

import Image from "next/image";
import Link from "next/link";
import { Aperture } from "lucide-react";
import { FeaturedProduct } from "../../_libs";
import { HighlightIcon } from "../../common/HighlightIcon";
import Badge from "@/components/ui/Badge";
import { formatVND } from "@/helpers";
import { memo } from "react";
import { StarRating } from "@/components/product/StarRating";
import { thumbnailUrl } from "@/helpers/resizeImage";

interface FlashPromoRule {
   actionType: string;
   discountValue: number | null;
}

interface HotSaleProductCardProps {
   product: FeaturedProduct;
   index?: number;
   flashPromoRule?: FlashPromoRule | null;
   isUpcoming?: boolean;
}

const HotSaleProductCard = memo(function HotSaleProductCard({
   product,
   index = 0,
   flashPromoRule,
   isUpcoming = false,
}: HotSaleProductCardProps) {
   const showFlashBadge = isUpcoming && flashPromoRule != null;

   const previewPrice = (() => {
      if (!showFlashBadge || !flashPromoRule?.discountValue) return null;
      if (flashPromoRule.actionType === "DISCOUNT_PERCENT")
         return Math.round(
            product.price.base * (1 - flashPromoRule.discountValue / 100),
         );
      if (flashPromoRule.actionType === "DISCOUNT_FIXED")
         return Math.max(0, product.price.base - flashPromoRule.discountValue);
      return null;
   })();

   const flashBadgeLabel = (() => {
      if (!flashPromoRule?.discountValue) return "Sale";
      if (flashPromoRule.actionType === "DISCOUNT_PERCENT")
         return `-${flashPromoRule.discountValue}%`;
      if (flashPromoRule.actionType === "DISCOUNT_FIXED") {
         return flashPromoRule.discountValue >= 1_000_000
            ? `-${(flashPromoRule.discountValue / 1_000_000).toFixed(0)}tr`
            : `-${(flashPromoRule.discountValue / 1000).toFixed(0)}k`;
      }
      return "Sale";
   })();

   const hasHighlights = product.highlights?.length > 0;

   return (
      <Link
         href={`/products/${product.slug}`}
         className="group relative flex flex-col h-full bg-neutral-light border border-neutral rounded-xl py-2 px-2 xs:py-5 xs:px-2.5 sm:py-6 sm:px-3 select-none"
         style={{ animationDelay: `${index * 0.08}s` }}
      >
         {/* Badge */}
         {showFlashBadge ? (
            <Badge
               label={flashBadgeLabel}
               isUpcoming
               className="-top-3 -left-3"
            />
         ) : (
            product.price.hasPromotion && (
               <Badge
                  discountPercent={product.price.discountPercentage}
                  className="-top-3 -left-3"
               />
            )
         )}

         {/* ── Image + Highlights row ── */}
         <div className="flex flex-row items-center gap-2 pb-3 mt-4 shrink-0">
            {/* Image: 2/3 width */}
            <div className="relative w-2/3 aspect-square shrink-0">
               {product.thumbnail ? (
                  <Image
                     src={thumbnailUrl(product.thumbnail, 160)}
                     alt={product.name}
                     fill
                     className="object-contain transition-transform duration-500 group-hover:scale-105"
                     sizes="(max-width: 400px) 45vw, (max-width: 640px) 35vw, 160px"
                  />
               ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral rounded-lg">
                     <Aperture
                        className="text-neutral-active w-10 h-10"
                        strokeWidth={1}
                     />
                  </div>
               )}
            </div>

            {/* Highlights: 1/3 width */}
            {hasHighlights && (
               <div className="w-1/3 flex flex-col justify-around h-full gap-1">
                  {product.highlights.map((highlight) => (
                     <div
                        key={highlight.key}
                        className="flex flex-col items-center gap-0.5"
                     >
                        <div className="w-4 h-4 xs:w-5 xs:h-5 flex items-center justify-center text-neutral-dark">
                           <HighlightIcon icon={highlight.icon} />
                        </div>
                        <span
                           className="text-[8px] xs:text-[9px] w-full text-center text-primary leading-tight break-words hyphens-auto"
                           style={{ textWrap: "balance" }}
                        >
                           {highlight.name}
                           <br />
                           <span className="font-semibold">
                              {highlight.value}
                           </span>
                        </span>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* ── Text info ── */}
         <div className="px-1 xs:px-2 flex flex-col flex-1">
            <h3 className="text-xs xs:text-[13px] sm:text-sm font-medium text-primary mb-1.5 line-clamp-2 min-h-8 sm:min-h-10 transition-colors">
               {product.name}
            </h3>

            <div className="flex flex-col gap-0.5 mb-1 sm:mb-1.5">
               {showFlashBadge && previewPrice != null ? (
                  <>
                     <span className="text-[11px] xs:text-xs sm:text-[13px] text-neutral-dark line-through min-h-4 sm:min-h-5">
                        {formatVND(product.price.base)}
                     </span>
                     <span className="text-sm xs:text-base sm:text-lg font-bold text-promotion leading-tight truncate">
                        {formatVND(previewPrice)}
                     </span>
                     <span className="text-[11px] text-neutral-dark mt-0.5">
                        🔥 Giá sale ngày mai
                     </span>
                  </>
               ) : (
                  <>
                     <span className="text-[11px] xs:text-xs sm:text-[13px] text-neutral-dark line-through min-h-4 sm:min-h-5">
                        {product.price.hasPromotion
                           ? formatVND(product.price.base)
                           : ""}
                     </span>
                     <span className="text-sm xs:text-base sm:text-lg font-bold text-promotion leading-tight truncate">
                        {formatVND(
                           product.price.hasPromotion
                              ? product.price.final
                              : product.price.base,
                        )}
                     </span>
                  </>
               )}
            </div>

            {product.rating.count > 0 && (
               <div className="flex items-center gap-0.5 sm:gap-1 mt-auto">
                  <StarRating average={product.rating.average} />
                  <span className="text-[10px] xs:text-[11px] sm:text-xs text-neutral-dark">
                     ({product.rating.count})
                  </span>
               </div>
            )}
         </div>
      </Link>
   );
});

export default HotSaleProductCard;
