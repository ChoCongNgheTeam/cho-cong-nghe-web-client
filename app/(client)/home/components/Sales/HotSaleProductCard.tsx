"use client";

import Image from "next/image";
import Link from "next/link";
import { FeaturedProduct } from "../../types";
import { HighlightIcon } from "../../../../components/product/HighlightIcon";
import { formatVND } from "@/helpers";
import { memo } from "react";
import { StarRating } from "@/components/product/StarRating";
import { thumbnailUrl } from "@/helpers/resizeImage";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";

// Design token — đỏ ấm, không phải đỏ cảnh báo
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

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const HotSaleProductCard = memo(function HotSaleProductCard({ product, index = 0, flashPromoRule, isUpcoming = false }: HotSaleProductCardProps) {
  const previewPrice = calcPreviewPrice(product, flashPromoRule);
  const discountLabel = calcDiscountLabel(product, flashPromoRule, previewPrice);

  const finalPrice = previewPrice ?? (product.price.hasPromotion ? product.price.final : product.price.base);

  const showStrikethrough = (flashPromoRule != null && previewPrice != null) || product.price.hasPromotion;

  const hasHighlights = product.highlights?.length > 0;

  const router = useRouter();
  const { addToCart } = useCart();

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
      router.push(`/products/${product.slug}`);
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col rounded-xl overflow-hidden select-none h-full border-neutral-100 hover:shadow-md"
      style={{
        backgroundColor: "rgb(var(--neutral-light))",
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* ── Section 1: Image + Highlights (fixed height) ── */}
      <div className="flex flex-row items-stretch gap-2 px-2.5 pt-3 pb-1.5 h-[180px] sm:h-[200px]  shrink-0 overflow-hidden">
        {/* Image */}
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
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg"
                style={{
                  color: "rgb(var(--neutral-dark))",
                  backgroundColor: "rgb(var(--neutral))",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h2l2-3h10l2 3h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
                  <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
                </svg>
                <span className="text-[9px] opacity-50">No image</span>
              </div>
            )}
          </div>
        </div>

        {/* Highlights */}
        <div className="w-1/3 flex flex-col justify-around gap-1 overflow-hidden">
          {hasHighlights ? (
            product.highlights.map((highlight) => (
              <div key={highlight.key} className="flex flex-col items-center gap-0.5 min-w-0">
                <div className="w-4 h-4 xs:w-5 xs:h-5 flex items-center justify-center shrink-0" style={{ color: "rgb(var(--neutral-dark))" }}>
                  <HighlightIcon icon={highlight.icon} />
                </div>
                <span className="text-[8px] xs:text-[9px] w-full text-center leading-tight break-words hyphens-auto" style={{ color: "rgb(var(--primary))", textWrap: "balance" }}>
                  {highlight.name}
                  <br />
                  <span className="font-semibold">{highlight.value}</span>
                </span>
              </div>
            ))
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
      </div>

      {/* ── Section 2: Price block ── */}
      <div className="mx-2.5 mb-2 rounded-lg px-2.5 py-2" style={{ background: BRAND_RED }}>
        {/* Mobile */}
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

        {/* Tablet / Desktop */}
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
            style={{
              color: BRAND_RED,
              borderColor: BRAND_RED,
            }}
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
