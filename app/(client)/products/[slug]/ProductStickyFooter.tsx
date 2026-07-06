"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { ProductDetail, Price } from "@/lib/types/product";
import AddToCartButton from "@/(client)/cart/components/AddToCartButton";
import { useToasty } from "@/components/toast";
import { useCart } from "../../../../hooks/useCart";
import { useRouter } from "next/navigation";
import QuantityControl from "@/components/shared/QuantityControl";
import type { ProductVariant, VariantOption } from "../types";

interface ProductStickyFooterProps {
  product: ProductDetail;
  selectedVariant?: ProductVariant;
  selectedPrice?: Price;
  infoRef?: React.RefObject<HTMLElement | null>;
  availableOptions?: VariantOption[];
  selectedOptions?: Record<string, string>;
}

const ProductStickyFooter = ({ product, selectedVariant, selectedPrice, infoRef, availableOptions = [], selectedOptions = {} }: ProductStickyFooterProps) => {
  const toasty = useToasty();
  const { addToCart } = useCart();
  const router = useRouter();

  const quantityRef = useRef(1);
  const handleQuantityChange = useCallback((qty: number) => {
    quantityRef.current = qty;
  }, []);

  const storageLabel = useMemo(
    () => availableOptions.find((opt) => opt.type === "storage")?.values?.find((v) => v.value === selectedOptions.storage)?.label ?? "",
    [availableOptions, selectedOptions.storage],
  );

  const [heroHidden, setHeroHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px)").matches : false));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!infoRef?.current) return;
    const observer = new IntersectionObserver(([entry]) => setHeroHidden(!entry.isIntersecting), { threshold: 0 });
    observer.observe(infoRef.current);
    return () => observer.disconnect();
  }, [infoRef]);

  const visible = isMobile ? true : heroHidden;

  const activePrice = selectedPrice || product.price;
  const displayPrice = activePrice?.hasPromotion ? activePrice.final : (activePrice?.base ?? 0);
  const finalPrice = activePrice?.final ?? activePrice?.base ?? 0;
  const basePrice = activePrice?.base ?? 0;

  const availQty = selectedVariant?.availableQuantity ?? selectedVariant?.stock ?? selectedVariant?.quantity ?? 0;
  const isOutOfStock = selectedVariant?.stockStatus === "out_of_stock" || availQty === 0;

  const imageUrl = selectedVariant?.image ?? selectedVariant?.images?.[0]?.imageUrl ?? "";

  const handleBuyNow = useCallback(async () => {
    if (!selectedVariant?.id) {
      toasty.warning("Vui lòng chọn phiên bản sản phẩm");
      return;
    }
    try {
      await addToCart(selectedVariant.id, quantityRef.current, {
        productName: product.name,
        productId: product.id,
        productSlug: product.slug,
        brandName: product.brand.name,
        variantName: selectedVariant.sku ?? "",
        price: finalPrice,
        originalPrice: basePrice,
        imageUrl,
        availableQuantity: availQty,
        color: selectedVariant.color ?? "",
        colorValue: selectedVariant.colorValue ?? "",
        storageLabel,
      });
      router.push("/cart");
    } catch {
      toasty.error("Không thể thêm vào giỏ hàng, vui lòng thử lại");
    }
  }, [selectedVariant, product, finalPrice, basePrice, imageUrl, availQty, storageLabel, addToCart, router, toasty]);

  const cartMeta = useMemo(
    () => ({
      productName: product.name,
      productId: product.id,
      productSlug: product.slug,
      brandName: product.brand.name,
      variantName: selectedVariant?.sku ?? "",
      price: finalPrice,
      originalPrice: basePrice,
      imageUrl,
      availableQuantity: availQty,
      color: selectedVariant?.color ?? "",
      colorValue: selectedVariant?.colorValue ?? "",
      storageLabel,
    }),
    [product, selectedVariant, finalPrice, basePrice, imageUrl, availQty, storageLabel],
  );

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-10
        border-t border-neutral bg-neutral-light
        shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
        transition-transform duration-300 ease-in-out
        ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="container sm:px-6">
        <div className="flex items-center gap-2 py-3">
          {/* Ảnh + Tên + Giá */}
          <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
            {imageUrl && (
              <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-neutral bg-neutral">
                <Image src={imageUrl} alt={product.name} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0 overflow-hidden">
              <p className="text-xs font-semibold text-primary truncate">{selectedVariant?.name || product.name}</p>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-xs sm:text-sm font-bold text-promotion whitespace-nowrap">{displayPrice.toLocaleString("vi-VN")}₫</span>
                {activePrice?.hasPromotion && (
                  <>
                    <span className="text-[10px] line-through text-neutral-dark hidden sm:inline whitespace-nowrap">{basePrice.toLocaleString("vi-VN")}₫</span>
                    <span className="text-[10px] font-bold text-neutral-light bg-promotion px-1 py-0.5 rounded whitespace-nowrap">-{activePrice.discountPercentage}%</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          {isOutOfStock ? (
            <span className="shrink-0 px-3 py-2 rounded-lg bg-neutral text-primary text-xs font-medium whitespace-nowrap">Hết hàng</span>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <QuantityControl maxStock={availQty} onChange={handleQuantityChange} />
              <AddToCartButton
                productVariantId={selectedVariant?.id || ""}
                getQuantity={() => quantityRef.current}
                disabled={!selectedVariant?.id}
                meta={cartMeta}
                label=""
                iconSize={20}
                className={`
                  !h-9 !w-9 sm:!w-auto sm:!px-3
                  !rounded-lg
                  !border !border-neutral-dark
                  !bg-neutral-light !text-primary
                  hover:!bg-neutral
                  active:scale-95
                  transition-all duration-200
                  disabled:!opacity-50 disabled:!cursor-not-allowed
                `}
              />
              <button
                onClick={handleBuyNow}
                disabled={!selectedVariant?.id}
                className="h-9 px-3 sm:px-5 rounded-lg bg-primary text-neutral-light
                  text-xs sm:text-sm font-semibold whitespace-nowrap
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
};

ProductStickyFooter.displayName = "ProductStickyFooter";

export default ProductStickyFooter;
