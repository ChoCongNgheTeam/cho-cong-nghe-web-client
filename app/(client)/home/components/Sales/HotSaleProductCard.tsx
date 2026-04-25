"use client";

import Image from "next/image";
import Link from "next/link";
import { FeaturedProduct } from "../../types";
import { formatVND } from "@/helpers";
import { memo } from "react";
import { thumbnailUrl } from "@/helpers/resizeImage";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { HighlightIcon } from "@/components/product/HighlightIcon";
import { StarRating } from "@/components/ui/StarRating";
import WishlistHeart from "@/components/shared/WishlistHeart";

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

function calcDiscountLabel(rule: FlashPromoRule | null | undefined, product: FeaturedProduct): string | null {
  if (rule?.discountValue) {
    if (rule.actionType === "DISCOUNT_PERCENT") return `-${rule.discountValue}%`;
    if (rule.actionType === "DISCOUNT_FIXED") return rule.discountValue >= 1_000_000 ? `-${(rule.discountValue / 1_000_000).toFixed(0)}tr` : `-${(rule.discountValue / 1000).toFixed(0)}k`;
  }
  if (product.price.hasPromotion) return `-${product.price.discountPercentage}%`;
  return null;
}

const HotSaleProductCard = memo(function HotSaleProductCard({ product, index = 0, flashPromoRule, isUpcoming = false }: HotSaleProductCardProps) {
  const previewPrice = calcPreviewPrice(product, flashPromoRule);
  const discountLabel = calcDiscountLabel(flashPromoRule, product);
  const finalPrice = previewPrice ?? (product.price.hasPromotion ? product.price.final : product.price.base);
  const showStrikethrough = (flashPromoRule != null && previewPrice != null) || product.price.hasPromotion;

  const visibleHighlights = (product.highlights ?? []).slice(0, 2);

  const router = useRouter();
  const { addToCart } = useCart();

  const productUrl = product.variantId ? `/products/${product.slug}?bundle=${product.variantId}` : `/products/${product.slug}`;

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.id) return;
    try {
      await addToCart(product.variantId, 1, {
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
      className="group relative flex flex-col rounded-xl overflow-hidden select-none h-full
                 border border-neutral-100
                 transition-all duration-300 ease-out
                 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        backgroundColor: "rgb(var(--neutral-light))",
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* ── Section 1: Image ── */}
      {/* ✅ overflow-hidden ở đây để ảnh không tràn ra ngoài card khi hover */}
      <div className="relative w-full aspect-[5/3] overflow-hidden">
        {product.thumbnail ? (
          <Image
            src={thumbnailUrl(product.thumbnail, 300)}
            alt={product.name}
            fill
            className="
              object-contain
              p-4
              scale-90
              transition-transform duration-500 ease-out
              group-hover:scale-100
            "
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
      </div>

      {/* ── Section 2: Highlights ── */}
      {visibleHighlights.length > 0 && (
        <div className="flex gap-1.5 px-2.5 pt-2 sm:flex-row flex-col">
          {visibleHighlights.map((h) => (
            <span
              key={h.key}
              title={h.value}
              className="
                inline-flex items-center gap-1 min-w-0
                bg-neutral-100 text-neutral-700
                border border-neutral-200
                dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700
                text-[10px] px-2 py-[2px] rounded-md font-medium
                sm:max-w-[48%] sm:shrink
              "
            >
              <HighlightIcon icon={h.icon} className="w-3 h-3 flex-shrink-0 text-neutral-500 dark:text-neutral-400" />
              <span className="truncate">{h.value}</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Section 3: Price block ── */}
      <div
        className="mx-2.5 mb-2 mt-2 rounded-lg px-2.5 py-2"
        style={{
          background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)",
          boxShadow: "0 2px 8px rgba(230, 57, 70, 0.25)",
        }}
      >
        {/* Mobile */}
        <div className="flex flex-col gap-0.5 sm:hidden">
          <span className="font-bold leading-tight text-white" style={{ fontSize: "clamp(11px, 3.5vw, 15px)" }}>
            {isUpcoming ? "Sắp công bố" : formatVND(finalPrice)}
          </span>
          {showStrikethrough && (
            <span className="line-through leading-none text-white/65" style={{ fontSize: "clamp(9px, 2.5vw, 11px)" }}>
              {formatVND(product.price.base)}
            </span>
          )}
          {discountLabel && (
            <span
              className="self-start text-[10px] font-bold rounded px-1.5 py-0.5 leading-none whitespace-nowrap text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)" }}
            >
              {isUpcoming ? "-XX%" : discountLabel}
            </span>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col flex-1 gap-1">
            <span className="font-bold leading-tight text-lg text-white">{isUpcoming ? "Sắp công bố" : formatVND(finalPrice)}</span>
            {showStrikethrough && <span className="text-[11px] line-through leading-none mt-0.5 text-white/65">{formatVND(product.price.base)}</span>}
          </div>
          {discountLabel && (
            <span
              className="shrink-0 text-[11px] font-bold rounded px-1.5 py-0.5 leading-none whitespace-nowrap self-start text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)" }}
            >
              {isUpcoming ? "-XX%" : discountLabel}
            </span>
          )}
        </div>
      </div>

      {/* ── Section 4: Product Name ── */}
      <div className="px-2.5 mb-2">
        <h3 className="text-xs xs:text-[13px] sm:text-[14px] font-medium line-clamp-2 leading-snug text-primary" style={{ minHeight: "calc(2 * 1.375em)" }}>
          {product.name}
        </h3>
      </div>

      {/* ── Section 5: CTA ── */}
      <div className="px-2.5 mb-2.5 mt-auto">
        {isUpcoming ? (
          <button
            className="w-full rounded-full h-8 xs:h-9 sm:h-10 text-center text-xs xs:text-sm font-semibold bg-transparent border cursor-pointer transition-colors duration-200"
            style={{ color: BRAND_RED, borderColor: BRAND_RED }}
          >
            Sắp diễn ra
          </button>
        ) : (
          <button
            onClick={handleBuyNow}
            className="w-full rounded-full h-8 xs:h-9 sm:h-10 text-center text-xs xs:text-sm font-semibold
                       border cursor-pointer transition-all duration-200 ease-out"
            style={{ color: BRAND_RED, borderColor: BRAND_RED }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget;
              btn.style.background = BRAND_RED;
              btn.style.color = "#fff";
              btn.style.boxShadow = "0 2px 8px rgba(230,57,70,0.35)";
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget;
              btn.style.background = "transparent";
              btn.style.color = BRAND_RED;
              btn.style.boxShadow = "none";
            }}
          >
            Mua giá sốc
          </button>
        )}
      </div>

      {/* ── Section 6: Rating ── */}
      <div className="px-2.5 pb-2.5 flex items-center justify-between">
        {product.rating.count > 0 ? (
          <StarRating average={product.rating.average} count={product.rating.count} />
        ) : (
          <span className="text-[9px] sm:text-[11px] text-neutral-400 italic">Chưa có đánh giá</span>
        )}
        <WishlistHeart productId={product.id} />
      </div>
    </Link>
  );
});

export default HotSaleProductCard;
