"use client";

import Image from "next/image";
import Link from "next/link";
import { FeaturedProduct } from "../../types";
import { formatVND } from "@/helpers";
import { memo, useRef, useEffect, useState } from "react";
import { StarRating } from "@/components/product/StarRating";
import { thumbnailUrl } from "@/helpers/resizeImage";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";

const BRAND_RED = "#e63946";

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

function calcPreviewPrice(product: FeaturedProduct, rule: FlashPromoRule | null | undefined): number | null {
  if (!rule?.discountValue) return null;
  if (rule.actionType === "DISCOUNT_PERCENT") return Math.round(product.price.base * (1 - rule.discountValue / 100));
  if (rule.actionType === "DISCOUNT_FIXED") return Math.max(0, product.price.base - rule.discountValue);
  return null;
}

function calcDiscountLabel(product: FeaturedProduct, rule: FlashPromoRule | null | undefined, previewPrice: number | null): string | null {
  if (rule?.discountValue) {
    if (rule.actionType === "DISCOUNT_PERCENT") return `-${rule.discountValue}%`;
    if (rule.actionType === "DISCOUNT_FIXED") {
      return rule.discountValue >= 1_000_000 ? `-${(rule.discountValue / 1_000_000).toFixed(0)}tr` : `-${(rule.discountValue / 1000).toFixed(0)}k`;
    }
  }
  if (product.price.hasPromotion) return `-${product.price.discountPercentage}%`;
  return null;
}

const HotSaleProductCard = memo(function HotSaleProductCard({ product, index = 0, flashPromoRule, isUpcoming = false }: HotSaleProductCardProps) {
  const previewPrice = calcPreviewPrice(product, flashPromoRule);
  const discountLabel = calcDiscountLabel(product, flashPromoRule, previewPrice);
  const finalPrice = previewPrice ?? (product.price.hasPromotion ? product.price.final : product.price.base);
  const showStrikethrough = (flashPromoRule != null && previewPrice != null) || product.price.hasPromotion;
  const hasHighlights = product.highlights?.length > 0;

  const chipsRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const el = chipsRef.current;
    if (el) setIsOverflow(el.scrollWidth > el.clientWidth);
  }, [product.highlights]);

  const router = useRouter();
  const { addToCart } = useCart();

  const productUrl = product.variantId ? `/products/${product.slug}?bundle=${product.variantId}` : `/products/${product.slug}`;

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.id) return;
    try {
      await addToCart(product.id, 1, {
        productName: product.name,
        productId: product.id,
        productSlug: product.slug,
        variantName: "",
        price: finalPrice,
        originalPrice: product.price.base,
        imageUrl: product.thumbnail ?? "",
        availableQuantity: 1,
        color: "",
        colorValue: "",
      });
      router.push("/cart");
    } catch {
      router.push(productUrl);
    }
  };

  return (
    <Link
      href={productUrl}
      className="group relative flex flex-col rounded-xl overflow-hidden select-none h-full border-neutral-100 hover:shadow-md"
      style={{ backgroundColor: "rgb(var(--neutral-light))", animationDelay: `${index * 0.08}s` }}
    >
      {/* ── Section 1: Image + Highlights ── */}
      <div className="relative w-full aspect-[5/3] overflow-hidden">
        {product.thumbnail ? (
          <Image
            src={thumbnailUrl(product.thumbnail, 300)}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 300px"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg" style={{ color: "rgb(var(--neutral-dark))", backgroundColor: "rgb(var(--neutral))" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h2l2-3h10l2 3h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
              <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
            </svg>
            <span className="text-[9px] opacity-50">No image</span>
          </div>
        )}

        {hasHighlights && (
          <>
            <div
              className="absolute bottom-0 left-0 right-0 h-10 
                            bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
            />
            <div className="absolute bottom-1.5 left-2 right-2 overflow-hidden">
              <div ref={chipsRef} className="flex gap-1">
                {product.highlights.slice(0, 3).map((h) => (
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

      {/* ── Section 2: Price block ── */}
      <div className="mx-2.5 mb-2 mt-1 rounded-lg px-2.5 py-2" style={{ background: BRAND_RED }}>
        <div className="flex flex-col gap-0.5 sm:hidden">
          <span className="font-bold leading-tight" style={{ fontSize: "clamp(11px, 3.5vw, 15px)", color: "#fff" }}>
            {isUpcoming ? "Sắp công bố" : formatVND(finalPrice)}
          </span>
          {showStrikethrough && (
            <span className="line-through leading-none" style={{ fontSize: "clamp(9px, 2.5vw, 11px)", color: "rgba(255,255,255,0.65)" }}>
              {formatVND(product.price.base)}
            </span>
          )}
          {discountLabel && (
            <span
              className="self-start text-[10px] font-bold rounded px-1.5 py-0.5 leading-none whitespace-nowrap"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)" }}
            >
              {isUpcoming ? "-XX%" : discountLabel}
            </span>
          )}
        </div>
        <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col flex-1 gap-1">
            <span className="font-bold leading-tight text-lg" style={{ color: "#fff" }}>
              {isUpcoming ? "Sắp công bố" : formatVND(finalPrice)}
            </span>
            {showStrikethrough && (
              <span className="text-[11px] line-through leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                {formatVND(product.price.base)}
              </span>
            )}
          </div>
          {discountLabel && (
            <span
              className="shrink-0 text-[11px] font-bold rounded px-1.5 py-0.5 leading-none whitespace-nowrap self-start"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)" }}
            >
              {isUpcoming ? "-XX%" : discountLabel}
            </span>
          )}
        </div>
      </div>

      {/* ── Section 3: Product Name ── */}
      <div className="px-2.5 mb-2 flex-1">
        <h3 className="text-xs xs:text-[13px] sm:text-[14px] font-medium line-clamp-2 leading-snug text-primary" style={{ minHeight: "calc(2 * 1.375em)" }}>
          {product.name}
        </h3>
      </div>

      {/* ── Section 4: CTA ── */}
      <div className="px-2.5 mb-2.5 mt-auto">
        {isUpcoming ? (
          <button
            className="w-full rounded-full h-8 xs:h-9 sm:h-10 text-center text-xs xs:text-sm font-semibold bg-transparent border cursor-pointer"
            style={{ color: BRAND_RED, borderColor: BRAND_RED }}
          >
            Sắp diễn ra
          </button>
        ) : (
          <button
            onClick={handleBuyNow}
            className="w-full rounded-full h-8 xs:h-9 sm:h-10 text-center text-xs xs:text-sm font-semibold border cursor-pointer transition-colors"
            style={{ color: BRAND_RED, borderColor: BRAND_RED }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = BRAND_RED;
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = BRAND_RED;
            }}
          >
            Mua giá sốc
          </button>
        )}
      </div>

      {/* ── Section 5: Rating ── */}
      {product.rating.count > 0 && (
        <div className="px-2.5 pb-2.5 flex items-center gap-1">
          <StarRating average={product.rating.average} />
          <span className="text-[10px] xs:text-[11px]" style={{ color: "rgb(var(--neutral-dark))" }}>
            ({product.rating.count})
          </span>
        </div>
      )}
    </Link>
  );
});

export default HotSaleProductCard;
