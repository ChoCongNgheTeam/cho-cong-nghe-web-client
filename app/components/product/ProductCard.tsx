"use client";

import Image from "next/image";
import Link from "next/link";
import WishlistHeart from "@/components/shared/WishlistHeart";
import { Product } from "./types";
import { formatVND } from "@/helpers";
import { thumbnailUrl } from "@/helpers/resizeImage";
import Badge from "../ui/Badge";
import { HighlightIcon } from "./HighlightIcon";
import { StarRating } from "../ui/StarRating";

interface ProductCardProps {
  product: Product;
  index?: number;
  showWishlist?: boolean;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasPromotion = product.price?.hasPromotion ?? false;
  const discountPercentage = product.price?.discountPercentage ?? 0;
  const highlights = product.highlights ?? [];
  const visibleHighlights = highlights.slice(0, 2);

  const productUrl = product.variantId ? `/products/${product.slug}?bundle=${product.variantId}` : `/products/${product.slug}`;

  return (
    <Link
      href={productUrl}
      // ✅ FIX: thêm "group" để group-hover hoạt động
      // ✅ IMPROVE: thêm transition cho shadow + scale nhẹ toàn card
      className="group relative flex flex-col bg-neutral-light border border-neutral-100
                 rounded-xl h-full
                 transition-all duration-300 ease-out
                 hover:shadow-lg hover:-translate-y-0.5"
    >
      {hasPromotion && (
        <div>
          <Badge discountPercent={discountPercentage} />
        </div>
      )}

      {/* ── Image ── */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl">
        {product.thumbnail ? (
          <Image
            src={thumbnailUrl(product.thumbnail, 300)}
            alt={product.name}
            fill
            // ✅ FIX: group-hover:scale-105 giờ hoạt động vì Link có class "group"
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-105 p-4"
            sizes="(max-width: 640px) 50vw, 300px"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100" />
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-1 sm:gap-1.5 p-2 sm:p-2.5 flex-1">
        <h3 className="text-xs sm:text-sm font-medium text-primary line-clamp-2 leading-snug" style={{ minHeight: "calc(2 * 1.375em)" }}>
          {product.name}
        </h3>

        {visibleHighlights.length > 0 && (
          <div className="flex gap-1 pt-1 sm:flex-row flex-col">
            {visibleHighlights.map((h) => (
              <span
                key={h.key}
                title={h.value}
                className="
                  inline-flex items-center gap-1 min-w-0
                  bg-neutral-100 text-neutral-700
                  border border-neutral-200
                  dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700
                  text-[10px] px-2 py-[2px]
                  rounded-md font-medium
                  sm:max-w-[48%] sm:shrink
                "
              >
                <HighlightIcon icon={h.icon} className="w-3 h-3 flex-shrink-0 text-neutral-500 dark:text-neutral-400" />
                <span className="truncate">{h.value}</span>
              </span>
            ))}
          </div>
        )}

        <div>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 line-through min-h-[14px]">{hasPromotion ? formatVND(product.price.base) : ""}</p>
          <p className="text-xs sm:text-sm font-semibold text-promotion">{formatVND(hasPromotion ? product.price.final : product.price.base)}</p>
        </div>

        <div className="flex justify-between items-center mt-auto pt-1">
          {product.rating?.count > 0 ? (
            <StarRating average={product.rating.average} count={product.rating.count} />
          ) : (
            <span className="text-[9px] sm:text-[11px] text-neutral-400 italic">Chưa có đánh giá</span>
          )}
          <WishlistHeart productId={product.id} />
        </div>
      </div>
    </Link>
  );
}
