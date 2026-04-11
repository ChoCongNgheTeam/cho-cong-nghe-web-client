"use client";

import Image from "next/image";
import Link from "next/link";
import WishlistHeart from "@/components/shared/WishlistHeart";
import { Product } from "./types";
import { formatVND } from "@/helpers";
import { thumbnailUrl } from "@/helpers/resizeImage";
import { useRef, useEffect, useState } from "react";
import Badge from "../ui/Badge";

interface ProductCardProps {
  product: Product;
  index?: number;
  showWishlist?: boolean;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasPromotion = product.price?.hasPromotion ?? false;
  const discountPercentage = product.price?.discountPercentage ?? 0;
  const highlights = product.highlights ?? [];

  const chipsRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const el = chipsRef.current;
    if (el) setIsOverflow(el.scrollWidth > el.clientWidth);
  }, [highlights]);

  const productUrl = product.variantId ? `/products/${product.slug}?bundle=${product.variantId}` : `/products/${product.slug}`;

  return (
    <Link
      href={productUrl}
      className="relative flex flex-col bg-neutral-light border border-neutral-100
                 hover:shadow-md rounded-xl h-full"
    >
      {hasPromotion && <Badge discountPercent={discountPercentage} />}

      {/* ── Image ── */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {product.thumbnail ? (
          <Image
            src={thumbnailUrl(product.thumbnail, 300)}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 300px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-dark bg-neutral" />
        )}

        {highlights.length > 0 && (
          <>
            <div
              className="absolute bottom-0 left-0 right-0 h-10
                            bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
            />
            <div className="absolute bottom-1.5 left-2 right-2 overflow-hidden">
              <div ref={chipsRef} className="flex gap-1 justify-center">
                {highlights.slice(0, 3).map((h) => (
                  <span
                    key={h.key}
                    className="bg-black/40 text-white text-[9px] px-1.5 py-0.5
                               rounded-full whitespace-nowrap backdrop-blur-sm shrink-0"
                  >
                    {h.value}
                  </span>
                ))}
              </div>
              {isOverflow && (
                <div
                  className="absolute inset-y-0 right-0 w-8
                                bg-gradient-to-r from-transparent to-black/40 pointer-events-none"
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-1.5 p-2.5 flex-1">
        {/* Tên sản phẩm: luôn giữ chỗ 2 dòng */}
        <h3 className="text-xs sm:text-sm font-medium text-primary line-clamp-2 leading-snug" style={{ minHeight: "calc(2 * 1.375em)" }}>
          {product.name}
        </h3>

        {/* Giá */}
        <div>
          <p className="text-[11px] text-neutral-400 line-through min-h-4">{hasPromotion ? formatVND(product.price.base) : ""}</p>
          <p className="text-sm sm:text-base font-semibold text-promotion">{formatVND(hasPromotion ? product.price.final : product.price.base)}</p>
        </div>

        {/* Rating + Wishlist: luôn ở đáy card */}
        <div className="flex justify-between items-center mt-auto pt-1">
          {product.rating?.count > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-xs font-medium text-neutral-600">{product.rating.average.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-[11px] text-neutral-400 italic">Chưa có đánh giá</span>
          )}
          <WishlistHeart productId={product.id} />
        </div>
      </div>
    </Link>
  );
}
