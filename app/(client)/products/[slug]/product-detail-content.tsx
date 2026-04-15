"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";

import ProductDetailBanner from "../components/product-detail/product-detail-banner";
import ProductDetailRight from "../components/product-detail/product-detail-card-right";
import ProductDetailSection from "../components/product-detail/product-detail-section";
import ProductDetailSection1 from "../components/product-detail/product-detail-section-1";
import ProductDetailSuggest from "../components/product-detail/product-detail-suggest";
import ProductReview from "../product-comment/Productreview";
import Breadcrumb from "../../../components/layout/Breadcrumb/Breadcrumb";
import ProductStickyFooter from "./ProductStickyFooter";
import { TrustBadges } from "@/(client)/home/components";

import { ProductDetail } from "@/lib/types/product";
import { getProductVariant } from "../_lib";
import { useProductSections, TABS } from "./useProductSections";
import type { ProductVariant, VariantOption, ProductPrice } from "../types";

interface ProductDetailContentProps {
  product: ProductDetail;
  slug: string;
}

/**
 * Sync selectedOptions từ currentVariant + availableOptions sau khi API trả về.
 *
 * Xử lý 2 mode:
 *   - Bundle mode (type="bundle"): đọc selected=true từ availableOptions
 *     (BE set đúng field này cho bundle), fallback về variant.id
 *   - Individual mode (color/storage/ram): đọc trực tiếp từ variant fields
 */
function syncOptionsFromVariant(variant: ProductVariant | undefined, availableOptions: VariantOption[]): Record<string, string> {
  if (!variant) return {};

  const result: Record<string, string> = {};

  for (const opt of availableOptions) {
    if (opt.type === "bundle") {
      // BE trả về selected=true cho bundle đang active
      const selected = opt.values?.find((v) => (v as any).selected === true);
      const activeValue = selected?.value ?? variant.id;
      if (activeValue) result["bundle"] = activeValue;
    } else if (opt.type === "color") {
      const val = variant.color ?? opt.values?.[0]?.value;
      if (val) result["color"] = val;
    } else if (opt.type === "storage") {
      const fromVariant = variant.storage as string | undefined;
      const fromCode = (() => {
        const m = variant.code?.match(/(\d+GB)/i);
        return m ? m[1].toLowerCase() : undefined;
      })();
      const val = fromVariant ?? fromCode ?? opt.values?.[0]?.value;
      if (val) result["storage"] = val;
    } else if (opt.type === "ram") {
      const val = (variant.ram as string | undefined) ?? opt.values?.[0]?.value;
      if (val) result["ram"] = val;
    } else {
      // Generic fallback cho các option type khác
      if (opt.values?.[0]) result[opt.type] = opt.values[0].value;
    }
  }

  return result;
}

export function ProductDetailContent({ product, slug }: ProductDetailContentProps) {
  const { breadcrumbRef, infoRef, specificationsRef, articleRef, reviewsRef, suggestRef, showStickyHeader, activeTab, scrollToSection, layoutChangingRef } = useProductSections();

  const tabBarRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!tabBarRef.current) return;
    const btn = tabBarRef.current.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
    if (btn) btn.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [activeTab]);

  /* ── Variant state ── */
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() =>
    syncOptionsFromVariant(product.currentVariant as unknown as ProductVariant, (product.availableOptions as VariantOption[]) || []),
  );
  const [availableOptions, setAvailableOptions] = useState<VariantOption[]>((product.availableOptions as VariantOption[]) || []);
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | undefined>(product.currentVariant as unknown as ProductVariant);
  const [variantImages, setVariantImages] = useState<{ imageUrl: string }[]>(product.currentVariant?.images?.map((img) => ({ imageUrl: img.imageUrl })) || []);
  const [price, setPrice] = useState<ProductPrice | undefined>(product.price);
  const [quantity, setQuantity] = useState(1);

  /* ─────────────────────────────────────────────────────────────────────────
   * fetchVariantByParams — batch tất cả state update sau khi có data API
   * ───────────────────────────────────────────────────────────────────────── */
  const fetchVariantByParams = useCallback(
    async (params: Record<string, string>) => {
      try {
        const data = await getProductVariant(product.slug, params);

        setAvailableOptions(data.availableOptions as VariantOption[]);
        setCurrentVariant(data.currentVariant);
        setVariantImages(data.currentVariant.images ?? []);
        setPrice(data.price);
        setQuantity(1);

        const synced = syncOptionsFromVariant(data.currentVariant, data.availableOptions as VariantOption[]);
        if (Object.keys(synced).length > 0) {
          setSelectedOptions(synced);
        }
      } catch (error) {
        console.error("Error fetching variant:", error);
      }
    },
    [product.slug],
  );

  /* ─────────────────────────────────────────────────────────────────────────
   * Mount: đọc ?bundle từ URL → load đúng variant từ card navigate
   * ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const bundleId = searchParams.get("bundle");

    const cleanUrl = () => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("bundle");
      const newUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
      window.history.replaceState(null, "", newUrl);
    };

    if (!bundleId) return;

    if (bundleId === product.currentVariant?.id) {
      cleanUrl();
      return;
    }

    fetchVariantByParams({ bundle: bundleId }).then(cleanUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────
   * handleOptionChange
   *
   * - type="bundle": gọi ?bundle=<variantId> trực tiếp
   * - type khác (color/storage/ram): gộp options, loại bỏ key "bundle" nếu có
   *   để tránh conflict khi sản phẩm chuyển từ bundle → individual mode
   * ───────────────────────────────────────────────────────────────────────── */
  const handleOptionChange = useCallback(
    async (type: string, value: string) => {
      if (type === "bundle") {
        await fetchVariantByParams({ bundle: value });
      } else {
        // Loại bỏ key "bundle" khỏi selectedOptions khi gọi individual params
        const { bundle: _drop, ...restOptions } = selectedOptions;
        const newOptions = { ...restOptions, [type]: value };
        await fetchVariantByParams(newOptions);
      }
    },
    [selectedOptions, fetchVariantByParams],
  );

  const handleColorChangeFromGallery = useCallback(
    async (variantId: string) => {
      if (variantId === currentVariant?.id) return;
      await fetchVariantByParams({ bundle: variantId });
    },
    [currentVariant?.id, fetchVariantByParams],
  );

  return (
    <div>
      {/* ── Sticky Tab Bar ── */}
      <div
        className="fixed left-0 right-0 z-40 bg-neutral-light shadow-md border-b border-neutral"
        style={{
          top: 0,
          transform: `translateY(var(--header-translate, 0px))`,
          transition: "opacity 0.2s ease, transform 0.3s ease-in-out",
          height: 48,
          opacity: showStickyHeader ? 1 : 0,
          pointerEvents: showStickyHeader ? "auto" : "none",
          visibility: showStickyHeader ? "visible" : "hidden",
        }}
      >
        <div className="container sm:px-6 h-full">
          <div ref={tabBarRef} className="flex items-center h-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`
                  relative px-4 py-3 text-sm font-medium whitespace-nowrap h-full
                  transition-colors cursor-pointer flex-shrink-0
                  ${activeTab === tab.id ? "text-accent" : "text-neutral-darker hover:text-primary"}
                `}
              >
                {tab.label}
                <span
                  className={`
                    absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full
                    transition-opacity duration-200
                    ${activeTab === tab.id ? "opacity-100" : "opacity-0"}
                  `}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="container sm:px-6 mt-4" ref={breadcrumbRef}>
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            {
              label: product.category.parent.name,
              href: `/category/${product.category?.slug}`,
            },
            { label: product.name },
          ]}
        />
      </div>

      {/* ── Hero / Thông tin sản phẩm ── */}
      <div className="sm:px-6 mt-4 sm:mt-6 lg:mt-8 container" ref={infoRef}>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 py-6">
          <div className="w-full lg:w-[60%] lg:sticky lg:top-16 lg:h-fit pr-6">
            <ProductDetailBanner product={product} selectedVariant={currentVariant} images={variantImages} onColorChange={handleColorChangeFromGallery} />
          </div>
          <div className="w-full lg:w-[40%]">
            <div className="lg:sticky lg:top-16 lg:h-fit">
              <ProductDetailRight
                key={currentVariant?.id}
                product={product}
                selectedVariant={currentVariant}
                selectedPrice={price}
                selectedOptions={selectedOptions}
                availableOptions={availableOptions}
                onOptionChange={handleOptionChange}
                onReviewClick={() => scrollToSection("reviews")}
                onSpecificationClick={() => scrollToSection("specs")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Thông số kỹ thuật ── */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={specificationsRef}>
        <div className="container !px-0">
          <ProductDetailSection slug={slug} product={product} />
        </div>
      </div>

      {/* ── Bài viết đánh giá ── */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={articleRef}>
        <div className="container !px-0">
          <ProductDetailSection1 product={product} layoutChangingRef={layoutChangingRef} />
        </div>
      </div>

      {/* ── Đánh giá & Hỏi đáp ── */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={reviewsRef}>
        <div className="container !px-0">
          <ProductReview productId={product.id} rating={product.rating} slug={product.slug} product={product} currentVariant={currentVariant} />
        </div>
      </div>

      {/* ── Sản phẩm liên quan ── */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={suggestRef}>
        <div className="container !px-0">
          <ProductDetailSuggest slug={slug} />
        </div>
      </div>

      <TrustBadges className="!bg-gray-400/10" />

      <ProductStickyFooter
        product={product}
        selectedVariant={currentVariant}
        selectedPrice={price}
        quantity={quantity}
        infoRef={infoRef}
        availableOptions={availableOptions}
        selectedOptions={selectedOptions}
      />
    </div>
  );
}
