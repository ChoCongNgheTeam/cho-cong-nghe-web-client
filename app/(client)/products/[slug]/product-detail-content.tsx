"use client";

import { useRef, useState, useEffect } from "react";
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
 * Đọc selectedOptions từ availableOptions.
 * Hoạt động với mọi mode:
 *   - bundle (type="bundle", value=variantId): lấy value của item có selected=true
 *   - individual (type="color"|"storage"...): lấy value của item có selected=true hoặc [0]
 */
function initSelectedOptions(availableOptions: VariantOption[]): Record<string, string> {
  const init: Record<string, string> = {};
  for (const opt of availableOptions) {
    const defaultVal = opt.values?.find((v) => v.selected) ?? opt.values?.[0];
    if (defaultVal) init[opt.type] = defaultVal.value;
  }
  return init;
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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => initSelectedOptions((product.availableOptions as VariantOption[]) || []));
  const [availableOptions, setAvailableOptions] = useState<VariantOption[]>((product.availableOptions as VariantOption[]) || []);
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | undefined>(product.currentVariant as unknown as ProductVariant);
  const [variantImages, setVariantImages] = useState<{ imageUrl: string }[]>(product.currentVariant?.images?.map((img) => ({ imageUrl: img.imageUrl })) || []);
  const [price, setPrice] = useState<ProductPrice | undefined>(product.price);
  const [quantity, setQuantity] = useState(1);

  /* ─────────────────────────────────────────────────────────────────────────
   * FIX A: Đọc ?bundle từ URL khi mount → gọi API load đúng variant.
   * Sau đó xóa ?bundle khỏi URL (window.history.replaceState) để URL sạch:
   *   BEFORE: /products/samsung-galaxy-s25-ultra-5g?bundle=ec8f095a-...
   *   AFTER:  /products/samsung-galaxy-s25-ultra-5g
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
      // SSR đã load đúng variant → chỉ cần clean URL
      cleanUrl();
      return;
    }

    fetchVariantByParams({ bundle: bundleId }).then(cleanUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────
   * FIX B: Sync selectedOptions từ availableOptions trả về (có selected flag).
   *
   * Trước: sync từ variant.color / variant.storage / variant.ram
   *   → bỏ sót type="bundle" vì bundle value là variantId, không phải attribute
   *
   * Sau: dùng initSelectedOptions(data.availableOptions) — BE đã set
   *   selected=true cho đúng item trong mọi mode (bundle, color, storage...)
   *   → "Phiên bản" selector tự highlight đúng 12GB/1TB
   * ───────────────────────────────────────────────────────────────────────── */
  const fetchVariantByParams = async (params: Record<string, string>) => {
    try {
      const data = await getProductVariant(product.slug, params);
      setAvailableOptions(data.availableOptions);
      setCurrentVariant(data.currentVariant);
      setVariantImages(data.currentVariant.images ?? []);
      setPrice(data.price);
      setQuantity(1);

      // Đọc selectedOptions từ availableOptions mới thay vì từ variant attributes
      const newOptions = initSelectedOptions(data.availableOptions as VariantOption[]);
      if (Object.keys(newOptions).length) {
        setSelectedOptions(newOptions);
      }
    } catch (error) {
      console.error("Error fetching variant:", error);
    }
  };

  const handleOptionChange = async (type: string, value: string) => {
    const newOptions = { ...selectedOptions, [type]: value };
    setSelectedOptions(newOptions);

    if (type === "bundle") {
      // Bundle mode: value chính là variantId → gọi thẳng bundle param
      await fetchVariantByParams({ bundle: value });
    } else {
      await fetchVariantByParams(newOptions);
    }
  };

  const handleColorChangeFromGallery = async (variantId: string) => {
    if (variantId === currentVariant?.id) return;
    await fetchVariantByParams({ bundle: variantId });
  };

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
