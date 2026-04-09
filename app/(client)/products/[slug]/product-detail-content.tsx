"use client";

import { useRef, useState, useEffect } from "react";

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
import apiRequest from "@/lib/api";
import { useProductSections, TABS } from "./useProductSections";

interface ProductDetailContentProps {
  product: ProductDetail;
  slug: string;
}

export function ProductDetailContent({ product, slug }: ProductDetailContentProps) {
  const { breadcrumbRef, infoRef, specificationsRef, articleRef, reviewsRef, suggestRef, stickyTop, showStickyHeader, activeTab, scrollToSection, layoutChangingRef } = useProductSections();

  const tabBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tabBarRef.current) return;
    const btn = tabBarRef.current.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
    if (btn) btn.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [activeTab]);

  /* ── Variant state ── */
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    product.availableOptions?.forEach((opt) => {
      const defaultVal = opt.values?.find((v: any) => v.selected) ?? opt.values?.[0];
      if (defaultVal) init[opt.type] = defaultVal.value;
    });
    return init;
  });

  const [availableOptions, setAvailableOptions] = useState(product.availableOptions || []);
  const [currentVariant, setCurrentVariant] = useState(product.currentVariant);
  const [variantImages, setVariantImages] = useState(product.currentVariant?.images || []);
  const [price, setPrice] = useState(product.price);
  const [quantity, setQuantity] = useState(1);

  const fetchVariantByParams = async (params: Record<string, string>) => {
    try {
      const json = await apiRequest.get<{ data: any }>(`/products/slug/${product.slug}/variant`, { noAuth: true, params });
      if (!json) return;
      const data = json.data;
      setAvailableOptions(data.availableOptions);
      setCurrentVariant(data.currentVariant);
      setVariantImages(data.currentVariant.images);
      setPrice(data.price);
      setQuantity(1);

      const variant = data.currentVariant;
      const newOptions: Record<string, string> = {};
      if (variant?.color) newOptions["color"] = variant.color;
      if (variant?.storage) newOptions["storage"] = variant.storage;
      if (variant?.ram) newOptions["ram"] = variant.ram;
      if (!newOptions["storage"] && variant?.code) {
        const storageMatch = variant.code.match(/(\d+GB)/i);
        if (storageMatch) newOptions["storage"] = storageMatch[1].toLowerCase();
      }
      if (Object.keys(newOptions).length) {
        setSelectedOptions((prev) => ({ ...prev, ...newOptions }));
      }
    } catch (error) {
      console.error("Error fetching variant:", error);
    }
  };

  const handleOptionChange = async (type: string, value: string) => {
    const newOptions = { ...selectedOptions, [type]: value };
    setSelectedOptions(newOptions);
    await fetchVariantByParams(newOptions);
  };

  const handleColorChangeFromGallery = async (variantId: string) => {
    if (variantId === currentVariant?.id) return;
    await fetchVariantByParams({ bundle: variantId });
  };

  return (
    <div>
      {/*
        ── Sticky Tab Bar ──────────────────────────────────────────────────
        position:sticky — tự dính không cần JS tính top mỗi frame.

        stickyTop chỉ thay đổi 2 lần per scroll session (khi header
        cross ngưỡng visible↔hidden), không phải mỗi frame.

        Ẩn/hiện bằng opacity+pointerEvents để không conflict sticky.
        ─────────────────────────────────────────────────────────────────── */}
      <div
        className="sticky z-40 bg-neutral-light shadow-md border-b border-neutral"
        style={{
          top: stickyTop,
          opacity: showStickyHeader ? 1 : 0,
          pointerEvents: showStickyHeader ? "auto" : "none",
          transition: "opacity 0.2s ease, top 0.15s ease",
          height: 48,
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
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: product.category.parent.name, href: `/category/${product.category?.slug}` }, { label: product.name }]} />
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
