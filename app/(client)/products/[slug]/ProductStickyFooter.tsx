"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ProductDetail } from "@/lib/types/product";
import AddToCartButton from "@/(client)/cart/components/AddToCartButton";
import { useToasty } from "@/components/Toast";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";

interface ProductVariant {
  id: string;
  price: number;
  images?: { imageUrl: string }[];
  sku?: string;
  originalPrice?: number;
  image?: string;
  color?: string;
  colorValue?: string;
  name?: string;
  availableQuantity?: number;
  stock?: number;
  quantity?: number;
  stockStatus?: "in_stock" | "out_of_stock";
}

type Price = {
  base: number;
  final: number;
  discountPercentage: number;
  hasPromotion: boolean;
};

interface ProductStickyFooterProps {
  product: ProductDetail;
  selectedVariant?: ProductVariant;
  selectedPrice?: Price;
  quantity?: number;
  /** ref của infoRef (hero section) — khi khuất viewport thì footer hiện */
  infoRef?: React.RefObject<HTMLElement | null>;
}

export default function ProductStickyFooter({
  product,
  selectedVariant,
  selectedPrice,
  quantity = 1,
  infoRef,
}: ProductStickyFooterProps) {
  const toasty = useToasty();
  const { addToCart } = useCart();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  /* ── Hiện khi hero section khuất khỏi viewport ─────────────────────── */
  useEffect(() => {
    if (!infoRef?.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(infoRef.current);
    return () => observer.disconnect();
  }, [infoRef]);

  /* ── Price ─────────────────────────────────────────────────────────── */
  const activePrice = selectedPrice || product.price;
  const displayPrice = activePrice?.hasPromotion
    ? activePrice.final
    : (activePrice?.base ?? 0);
  const finalPrice = activePrice?.final ?? activePrice?.base ?? 0;
  const basePrice = activePrice?.base ?? 0;

  const maxStock = selectedVariant?.quantity ?? 0;
  const isOutOfStock =
    selectedVariant?.stockStatus === "out_of_stock" || maxStock === 0;

  /* ── Image ─────────────────────────────────────────────────────────── */
  const imageUrl =
    selectedVariant?.image ??
    selectedVariant?.images?.[0]?.imageUrl ??
    (product as any)?.img?.[0]?.imageUrl ??
    "";

  /* ── Buy now ───────────────────────────────────────────────────────── */
  const handleBuyNow = async () => {
    if (!selectedVariant?.id) {
      toasty.warning("Vui lòng chọn phiên bản sản phẩm");
      return;
    }
    try {
      await addToCart(selectedVariant.id, quantity, {
        productName: product.name,
        productId: product.id,
        productSlug: product.slug,
        brandName: product.brand.name,
        variantName: selectedVariant.sku ?? "",
        price: finalPrice,
        originalPrice: basePrice,
        imageUrl,
        availableQuantity:
          selectedVariant.availableQuantity ?? selectedVariant.stock ?? 0,
        color: selectedVariant.color ?? "",
        colorValue: selectedVariant.colorValue ?? "",
      });
      router.push("/cart");
    } catch {
      toasty.error("Không thể thêm vào giỏ hàng, vui lòng thử lại");
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-10
        border-t border-neutral bg-neutral-light
        shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
        transition-transform duration-300 ease-in-out
        ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="container sm:px-6">
        <div className="flex items-center gap-3 py-3">
          {/* ── Ảnh + Tên + Giá ──────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {imageUrl && (
              <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden border border-neutral bg-neutral">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-primary line-clamp-1">
                {selectedVariant?.name || product.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm sm:text-base font-bold text-promotion">
                  {displayPrice.toLocaleString("vi-VN")}₫
                </span>
                {activePrice?.hasPromotion && (
                  <>
                    <span className="text-xs line-through text-neutral-dark hidden sm:inline">
                      {basePrice.toLocaleString("vi-VN")}₫
                    </span>
                    <span className="text-[10px] font-bold text-neutral-light bg-promotion px-1.5 py-0.5 rounded">
                      -{activePrice.discountPercentage}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Buttons ──────────────────────────────────────────────── */}
          {isOutOfStock ? (
            <span className="shrink-0 px-4 py-2.5 rounded-lg bg-neutral text-primary text-sm font-medium">
              Hết hàng
            </span>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              {/* Thêm giỏ hàng */}
              <AddToCartButton
                productVariantId={selectedVariant?.id || ""}
                quantity={quantity}
                disabled={!selectedVariant?.id}
                meta={{
                  productName: product.name,
                  productId: product.id,
                  productSlug: product.slug,
                  brandName: product.brand.name,
                  variantName: selectedVariant?.sku ?? "",
                  price: finalPrice,
                  originalPrice: basePrice,
                  imageUrl,
                  availableQuantity:
                    selectedVariant?.availableQuantity ??
                    selectedVariant?.stock ??
                    0,
                  color: selectedVariant?.color ?? "",
                  colorValue: selectedVariant?.colorValue ?? "",
                }}
                label=""
                iconSize={20}
                className={`
                  !h-10 !w-10 sm:!w-auto sm:!px-4
                  !rounded-lg
                  !border !border-neutral-dark
                  !bg-neutral-light !text-primary
                  hover:!bg-neutral
                  active:scale-95
                  transition-all duration-200
                  disabled:!opacity-50 disabled:!cursor-not-allowed
                `}
              />

              {/* Mua ngay */}
              <button
                onClick={handleBuyNow}
                disabled={!selectedVariant?.id}
                className="h-10 px-4 sm:px-6 rounded-lg bg-primary text-neutral-light
                  text-sm font-semibold whitespace-nowrap
                  hover:bg-primary-hover active:scale-95
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Mua ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
