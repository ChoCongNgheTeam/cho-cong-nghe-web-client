"use client";

import Image from "next/image";
import Link from "next/link";
import WishlistHeart from "@/components/shared/WishlistHeart";
import { HighlightIcon } from "@/(client)/home/common/HighlightIcon";
import { Product } from "./types";
import Badge from "../ui/Badge";
import { formatVND } from "@/helpers";
import { StarRating } from "./StarRating";
import { thumbnailUrl } from "@/helpers/resizeImage";

interface ProductCardProps {
  product: Product;
  index?: number;
  showWishlist?: boolean;
}

export default function ProductCard({ product, index = 0, showWishlist = false }: ProductCardProps) {
  const hasPromotion = product.price?.hasPromotion ?? false;
  const discountPercentage = product.price?.discountPercentage ?? 0;
  const highlights = product.highlights ?? [];
  const hasHighlights = highlights.length > 0;

  return (
    <Link href={`/products/${product.slug}`} className="group relative flex flex-col h-full bg-neutral-light border border-neutral rounded-xl py-2 px-2 xs:py-5 xs:px-2.5 sm:py-6 sm:px-3">
      {showWishlist && <WishlistHeart productId={product.id} />}
      {hasPromotion && <Badge discountPercent={discountPercentage} className="-top-3 -left-3" />}

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
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-neutral-dark bg-neutral rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h2l2-3h10l2 3h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
                <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
              </svg>
              <span className="text-[9px] opacity-50">No image</span>
            </div>
          )}
        </div>

        {/* Highlights: 1/3 width — chỉ render khi có */}
        {hasHighlights && (
          <div className="w-1/3 flex flex-col justify-around h-full gap-1">
            {highlights.map((highlight) => (
              <div key={highlight.key} className="flex flex-col items-center gap-0.5">
                <div className="w-4 h-4 xs:w-5 xs:h-5 flex items-center justify-center text-neutral-dark">
                  <HighlightIcon icon={highlight.icon} />
                </div>
                <span className="text-[8px] xs:text-[9px] w-full text-center text-primary leading-tight break-words hyphens-auto" style={{ textWrap: "balance" }}>
                  {highlight.name}
                  <br />
                  <span className="font-semibold text-balance">{highlight.value}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Text info ── */}
      <div className="px-1 xs:px-2 flex flex-col flex-1">
        <h3 className="text-xs xs:text-[13px] sm:text-sm font-medium text-primary mb-1.5 line-clamp-2 min-h-8 sm:min-h-10 transition-colors">{product.name}</h3>

        <div className="flex flex-col gap-0.5 mb-1 sm:mb-1.5">
          <span className="text-[11px] xs:text-xs sm:text-[13px] text-neutral-dark line-through min-h-4 sm:min-h-5">{hasPromotion ? formatVND(product.price.base) : ""}</span>
          <span className="text-sm xs:text-base sm:text-lg font-bold text-promotion leading-tight truncate">{formatVND(hasPromotion ? product.price.final : product.price.base)}</span>
        </div>

        {product.rating.count > 0 && (
          <div className="flex items-center gap-0.5 sm:gap-1 mt-auto">
            <StarRating average={product.rating.average} />
            <span className="text-[10px] xs:text-[11px] sm:text-xs text-neutral-dark">({product.rating.count})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
