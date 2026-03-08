// app/(client)/cart/components/CartVariantSelector.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import apiRequest from "@/lib/api";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductVariant {
  id: string;
  code: string;
  price: number;
  isActive: boolean;
  available: boolean;
  stockStatus: "in_stock" | "out_of_stock" | "low_stock";
  inventory?: {
    quantity: number;
    available: number;
  };
  attributes?: Record<string, string>; // { color: "Black Titanium", storage: "256GB" }
}

interface ApiProductDetailResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    slug: string;
    variants?: ProductVariant[];
    currentVariant?: ProductVariant;
  };
}

interface CartVariantSelectorProps {
  cartItemId: string;        // uuid của cart item → dùng cho change-variant
  productSlug: string;       // slug của sản phẩm → dùng để fetch product detail
  currentVariantId: string;  // uuid của variant hiện tại
  currentVariantCode: string; // code/SKU hiển thị
  currentQuantity: number;
  onSuccess?: () => void;
}

function formatVND(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price) + "₫";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CartVariantSelector({
  cartItemId,
  productSlug,
  currentVariantId,
  currentVariantCode,
  currentQuantity,
  onSuccess,
}: CartVariantSelectorProps) {

  console.log("[CartVariantSelector] props:", {
    cartItemId,
    productSlug,
    currentVariantId,
    currentVariantCode,
    currentQuantity,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch product detail theo slug → lấy mảng variants
  const fetchVariants = useCallback(async () => {
    if (hasFetched) return;
    setIsFetching(true);
    setFetchError(null);

    const url = `/products/slug/${productSlug}`;
    console.log("[CartVariantSelector] fetching URL:", url);

    try {
      const res = await apiRequest.get<ApiProductDetailResponse>(url);
      console.log("[CartVariantSelector] response:", res);

      const allVariants = res.data?.variants ?? [];
      console.log("[CartVariantSelector] variants found:", allVariants.length, allVariants);

      const activeVariants = allVariants.filter((v) => v.isActive);
      setVariants(activeVariants);
      setHasFetched(true);
    } catch (err) {
      console.error("[CartVariantSelector] fetchVariants ERROR:", err);
      setFetchError("Không thể tải biến thể");
    } finally {
      setIsFetching(false);
    }
  }, [productSlug, hasFetched]);

  const handleToggle = () => {
    if (isChanging) return;
    setIsOpen((prev) => {
      if (!prev) fetchVariants();
      return !prev;
    });
  };

  const handleRetry = () => {
    setHasFetched(false);
    fetchVariants();
  };

  useEffect(() => {
    if (!isOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  const handleSelect = async (variant: ProductVariant) => {
    if (!variant.available) return;
    if (variant.id === currentVariantId) {
      setIsOpen(false);
      return;
    }

    console.log("[CartVariantSelector] change-variant:", {
      url: `/cart/${cartItemId}/change-variant`,
      body: { newVariantId: variant.id, quantity: currentQuantity },
    });

    setIsChanging(true);
    setIsOpen(false);

    try {
      const res = await apiRequest.put(`/cart/${cartItemId}/change-variant`, {
        newVariantId: variant.id,
        quantity: currentQuantity,
      });
      console.log("[CartVariantSelector] change-variant response:", res);
      toast.success("Đã cập nhật phiên bản sản phẩm");
      onSuccess?.();
    } catch (err) {
      console.error("[CartVariantSelector] change-variant ERROR:", err);
      toast.error("Không thể đổi phiên bản, vui lòng thử lại");
    } finally {
      setIsChanging(false);
    }
  };

  // Nếu fetch xong mà không có variants (backend chưa hỗ trợ) → chỉ hiện text
  if (hasFetched && variants.length <= 1) {
    return (
      <div className="text-xs text-neutral-darker mb-2">
        {currentVariantCode}
      </div>
    );
  }

  return (
    <div className="relative inline-block mb-2" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        disabled={isChanging}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-neutral rounded
          hover:border-accent transition-colors bg-neutral-light
          disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isChanging ? (
          <Loader2 className="h-3 w-3 animate-spin text-accent" />
        ) : isFetching && !hasFetched ? (
          <Loader2 className="h-3 w-3 animate-spin text-neutral-dark" />
        ) : (
          <span className="font-medium text-neutral-darker max-w-[180px] truncate">
            {currentVariantCode}
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 text-neutral-dark transition-transform shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 bg-neutral-light border border-neutral
          rounded-lg shadow-lg z-50 min-w-[220px] max-w-[300px]"
        >
          {isFetching && (
            <div className="flex items-center justify-center gap-2 py-4 px-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span className="text-xs text-neutral-darker">Đang tải...</span>
            </div>
          )}

          {fetchError && !isFetching && (
            <div className="py-3 px-3 text-center">
              <p className="text-xs text-red-500 mb-2">{fetchError}</p>
              <button
                onClick={handleRetry}
                className="text-xs text-accent underline hover:text-accent-hover transition"
              >
                Thử lại
              </button>
            </div>
          )}

          {!isFetching && !fetchError && hasFetched && (
            <div className="py-1 max-h-[280px] overflow-y-auto">
              {variants.map((variant) => {
                const isSelected = variant.id === currentVariantId;
                const isOutOfStock = !variant.available;
                // Hiển thị attributes nếu có, fallback về code
                const label = variant.attributes
                  ? Object.values(variant.attributes).join(" / ")
                  : variant.code;

                return (
                  <button
                    key={variant.id}
                    onClick={() => handleSelect(variant)}
                    disabled={isOutOfStock}
                    className={`w-full px-3 py-2.5 text-left text-sm transition-colors
                      ${isSelected
                        ? "bg-accent/10 text-primary"
                        : isOutOfStock
                          ? "text-neutral-dark cursor-not-allowed opacity-50"
                          : "hover:bg-neutral text-neutral-darker cursor-pointer"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium line-clamp-1">{label}</div>
                        <div className="text-xs text-neutral-dark mt-0.5">
                          {formatVND(variant.price)}
                          {isOutOfStock && (
                            <span className="ml-2 text-red-500 font-medium">· Hết hàng</span>
                          )}
                        </div>
                      </div>
                      {isSelected && !isOutOfStock && (
                        <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}