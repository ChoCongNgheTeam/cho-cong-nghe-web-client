"use client";

import Image from "next/image";
import Link from "next/link";
import { FeaturedProduct } from "../../_libs";
import { HighlightIcon } from "../../common/HighlightIcon";
import { formatVND } from "@/helpers";
import { memo } from "react";
import { StarRating } from "@/components/product/StarRating";
import { thumbnailUrl } from "@/helpers/resizeImage";

interface FlashPromoRule {
   actionType: string;
   discountValue: number | null;
   totalSlots?: number;
   remainingSlots?: number;
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
   const showFlashBadge = flashPromoRule != null;

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

   const discountLabel = (() => {
      if (showFlashBadge && flashPromoRule?.discountValue) {
         if (flashPromoRule.actionType === "DISCOUNT_PERCENT")
            return `-${flashPromoRule.discountValue}%`;
         if (flashPromoRule.actionType === "DISCOUNT_FIXED") {
            return flashPromoRule.discountValue >= 1_000_000
               ? `-${(flashPromoRule.discountValue / 1_000_000).toFixed(0)}tr`
               : `-${(flashPromoRule.discountValue / 1000).toFixed(0)}k`;
         }
      }
      if (product.price.hasPromotion)
         return `-${product.price.discountPercentage}%`;
      return null;
   })();

   const finalPrice =
      previewPrice ??
      (product.price.hasPromotion ? product.price.final : product.price.base);

   const showStrikethrough =
      (showFlashBadge && previewPrice != null) || product.price.hasPromotion;

   const hasHighlights = product.highlights?.length > 0;

   return (
      <Link
         href={`/products/${product.slug}`}
         className="group relative flex flex-col rounded-xl overflow-hidden select-none h-full"
         style={{
            backgroundColor: "rgb(var(--neutral-light))",
            animationDelay: `${index * 0.08}s`,
         }}
      >
         {/* ══════════════════════════════════════════
             SECTION 1: Image + Highlights
             KEY FIX: Fixed height (h-[180px] mobile, h-[200px] sm+) with
             shrink-0 so this section NEVER resizes based on content.
             overflow-hidden clips anything that would escape the box.
         ══════════════════════════════════════════ */}
         <div
            className="flex flex-row items-stretch gap-2 px-2.5 pt-3 pb-1.5
                        h-[180px] sm:h-[200px] shrink-0 overflow-hidden"
         >
            {/* Image container: aspect-square creates a stable intrinsic size.
                overflow-hidden prevents hover-scale from bleeding out. */}
            <div className="w-2/3 shrink-0 flex items-center overflow-hidden">
               <div className="relative w-full aspect-square">
                  {product.thumbnail ? (
                     <Image
                        src={thumbnailUrl(product.thumbnail, 160)}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 400px) 45vw, (max-width: 640px) 35vw, 160px"
                     />
                  ) : (
                     /* absolute inset-0 fills the aspect-ratio box so the
                        placeholder is always identical in size to a real image. */
                     <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg"
                        style={{
                           color: "rgb(var(--neutral-dark))",
                           backgroundColor: "rgb(var(--neutral))",
                        }}
                     >
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           className="w-8 h-8 opacity-40"
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
                        <span className="text-[9px] opacity-50">No image</span>
                     </div>
                  )}
               </div>
            </div>

            {/* Highlights column: justify-around spaces items evenly within
                the fixed-height parent. overflow-hidden stops a long list
                from escaping the container and pushing the price down. */}
            <div className="w-1/3 flex flex-col justify-around gap-1 overflow-hidden">
               {hasHighlights ? (
                  product.highlights.map((highlight) => (
                     <div
                        key={highlight.key}
                        className="flex flex-col items-center gap-0.5 min-w-0"
                     >
                        <div
                           className="w-4 h-4 xs:w-5 xs:h-5 flex items-center justify-center shrink-0"
                           style={{ color: "rgb(var(--neutral-dark))" }}
                        >
                           <HighlightIcon icon={highlight.icon} />
                        </div>
                        <span
                           className="text-[8px] xs:text-[9px] w-full text-center leading-tight break-words hyphens-auto"
                           style={{
                              color: "rgb(var(--primary))",
                              textWrap: "balance",
                           }}
                        >
                           {highlight.name}
                           <br />
                           <span className="font-semibold">
                              {highlight.value}
                           </span>
                        </span>
                     </div>
                  ))
               ) : (
                  /* Empty div preserves the column in the layout. */
                  <div className="w-full h-full" />
               )}
            </div>
         </div>

         {/* ══════════════════════════════════════════
             SECTION 2: Price
             Because Section 1 has a fixed height, the price always starts
             at the same vertical offset on every card.
         ══════════════════════════════════════════ */}
         <div
            className="mx-2.5 mb-2 rounded-lg px-2.5 py-2"
            style={{ background: "#e24c5a" }}
         >
            {/* MOBILE */}
            <div className="flex flex-col gap-0.5 sm:hidden">
               <span
                  className="font-bold leading-tight"
                  style={{
                     fontSize: "clamp(11px, 3.5vw, 15px)",
                     color: "#fff",
                  }}
               >
                  {isUpcoming ? "Sắp công bố" : formatVND(finalPrice)}
               </span>

               {showStrikethrough && (
                  <span
                     className="line-through leading-none"
                     style={{
                        fontSize: "clamp(9px, 2.5vw, 11px)",
                        color: "rgba(255,255,255,0.65)",
                     }}
                  >
                     {formatVND(product.price.base)}
                  </span>
               )}

               {discountLabel && (
                  <span
                     className="self-start text-[10px] font-bold rounded px-1.5 py-0.5 leading-none whitespace-nowrap"
                     style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.4)",
                     }}
                  >
                     {isUpcoming ? "-XX%" : discountLabel}
                  </span>
               )}
            </div>

            {/* TABLET / DESKTOP */}
            <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-2">
               <div className="flex flex-col flex-1 gap-1">
                  <span
                     className="font-bold leading-tight text-lg"
                     style={{ color: "#fff" }}
                  >
                     {isUpcoming ? "Sắp công bố" : formatVND(finalPrice)}
                  </span>
                  {showStrikethrough && (
                     <span
                        className="text-[11px] line-through leading-none mt-0.5"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                     >
                        {formatVND(product.price.base)}
                     </span>
                  )}
               </div>

               {discountLabel && (
                  <span
                     className="shrink-0 text-[11px] font-bold rounded px-1.5 py-0.5 leading-none whitespace-nowrap self-start"
                     style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.4)",
                     }}
                  >
                     {isUpcoming ? "-XX%" : discountLabel}
                  </span>
               )}
            </div>
         </div>

         {/* ══════════════════════════════════════════
             SECTION 3: Product Name
         ══════════════════════════════════════════ */}
         <div className="px-2.5 mb-2">
            <h3 className="text-xs xs:text-[13px] sm:text-[14px] font-medium line-clamp-2 leading-snug text-primary">
               {product.name}
            </h3>
         </div>

         {/* ══════════════════════════════════════════
             SECTION 4: CTA Button
         ══════════════════════════════════════════ */}
         <div className="px-2.5 mb-2.5">
            {isUpcoming ? (
               <button className="w-full rounded-full h-8 xs:h-9 sm:h-10 text-center text-xs xs:text-sm font-semibold bg-transparent text-[#e24c5a] border border-[#e24c5a]">
                  Sắp diễn ra
               </button>
            ) : (
               <button className="w-full rounded-full h-8 xs:h-9 sm:h-10 text-center text-xs xs:text-sm font-semibold border border-[#e24c5a] text-[#e24c5a] cursor-pointer">
                  Mua giá sốc
               </button>
            )}
         </div>

         {/* ══════════════════════════════════════════
             SECTION 5: Rating
         ══════════════════════════════════════════ */}
         {product.rating.count > 0 && (
            <div className="px-2.5 pb-2.5 flex items-center gap-1">
               <StarRating average={product.rating.average} />
               <span
                  className="text-[10px] xs:text-[11px]"
                  style={{ color: "rgb(var(--neutral-dark))" }}
               >
                  ({product.rating.count})
               </span>
            </div>
         )}
      </Link>
   );
});

export default HotSaleProductCard;
