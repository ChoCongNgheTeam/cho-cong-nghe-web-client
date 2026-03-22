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

interface FlashPromoRule {
  actionType: string;
  discountValue: number | null;
}

interface HotSaleProductCardProps {
  product: FeaturedProduct;
  index?: number;
  flashPromoRule?: FlashPromoRule | null; // ← thay flashSalePercent
  isUpcoming?: boolean;
}

const HotSaleProductCard = memo(function HotSaleProductCard({ product, index = 0, flashPromoRule, isUpcoming = false }: HotSaleProductCardProps) {
  const showFlashBadge = isUpcoming && flashPromoRule != null;

  // Tính giá preview khi upcoming
  const previewPrice = (() => {
    if (!showFlashBadge || !flashPromoRule?.discountValue) return null;
    if (flashPromoRule.actionType === "DISCOUNT_PERCENT") {
      return Math.round(product.price.base * (1 - flashPromoRule.discountValue / 100));
    }
    if (flashPromoRule.actionType === "DISCOUNT_FIXED") {
      return Math.max(0, product.price.base - flashPromoRule.discountValue);
    }
    return null;
  })();

  // Label badge cho upcoming
  const flashBadgeLabel = (() => {
    if (!flashPromoRule?.discountValue) return "Sale";
    if (flashPromoRule.actionType === "DISCOUNT_PERCENT") return `-${flashPromoRule.discountValue}%`;
    if (flashPromoRule.actionType === "DISCOUNT_FIXED") {
      const val = flashPromoRule.discountValue >= 1_000_000 ? `-${(flashPromoRule.discountValue / 1_000_000).toFixed(0)}tr` : `-${(flashPromoRule.discountValue / 1000).toFixed(0)}k`;
      return val;
    }
    return "Sale";
  })();

  return (
    <Link href={`/products/${product.slug}`} className="group relative flex flex-col h-full bg-neutral-light rounded-sm select-none p-3.5 ease-in-out" style={{ animationDelay: `${index * 0.08}s` }}>
      {/* Badge */}
      {showFlashBadge ? <Badge label={flashBadgeLabel} isUpcoming /> : product.price.hasPromotion && <Badge discountPercent={product.price.discountPercentage} />}

      <div className="flex flex-row items-center px-4 pt-7 pb-3 h-44 shrink-0">
        <div className="relative w-[62%] h-full">
          {product.thumbnail ? (
            <Image src={product.thumbnail} alt={product.name} fill className="object-contain transition-transform duration-500 group-hover:scale-105" sizes="175px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral rounded">
              <Aperture className="text-neutral-active w-10 h-10" strokeWidth={1} />
            </div>
          )}
        </div>

        <div className="flex flex-col w-[38%] h-full items-center justify-evenly pt-1 pb-1">
          {product.highlights.map((highlight) => (
            <div key={highlight.key} className="flex flex-col items-center gap-0.75">
              <HighlightIcon icon={highlight.icon} />
              <span className="text-[10px] leading-3.25 text-primary font-medium text-center">
                {highlight.name}
                <br />
                {highlight.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Product Name */}
      <div className="px-4 py-2.5">
        <h3 className="font-medium line-clamp-2 transition-colors duration-200 text-primary min-h-10">{product.name}</h3>
      </div>

      {/* Pricing */}
      <div className="px-4 pb-3">
        {showFlashBadge && previewPrice != null ? (
          <>
            <p className="text-xl font-bold text-promotion">{formatVND(previewPrice)}</p>
            <div className="flex items-center mt-1.5 gap-2 min-h-7">
              <span className="line-through text-[13px] text-neutral-dark font-normal">{formatVND(product.price.base)}</span>
              <span className="font-bold text-[16px] leading-none text-promotion">{flashBadgeLabel}</span>
            </div>
            <span className="text-[11px] text-neutral-dark mt-1 block">🔥 Giá sale ngày mai</span>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-promotion">{formatVND(product.price.hasPromotion ? product.price.final : product.price.base)}</p>
            <div className="flex items-center mt-1.5 gap-2 min-h-7">
              {product.price.hasPromotion && (
                <>
                  <span className="line-through text-[13px] text-neutral-dark font-normal">{formatVND(product.price.base)}</span>
                  <span className="font-bold text-[22px] leading-none text-promotion">-{product.price.discountPercentage}%</span>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {product.rating.count > 0 && (
        <div className="px-4 pb-4 flex items-center gap-1">
          <StarRating average={product.rating.average} />
          <span className="text-xs text-neutral-dark">({product.rating.count})</span>
        </div>
      )}
    </Link>
  );
});

export default HotSaleProductCard;
