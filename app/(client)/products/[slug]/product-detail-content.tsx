"use client";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BsPatchCheckFill } from "react-icons/bs";
import { HiOutlineRefresh } from "react-icons/hi";
import { FaTruck } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

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

export function ProductDetailContent({
  product,
  slug,
}: ProductDetailContentProps) {
  const searchParams = useSearchParams();

  /* ============================================================================
   * SCROLL TO TOP ON MOUNT
   * ========================================================================== */
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  /* ============================================================================
   * SECTIONS HOOK
   * ========================================================================== */
  const {
    breadcrumbRef,
    infoRef,
    specificationsRef,
    articleRef,
    reviewsRef,
    suggestRef,
    headerHeight,
    effectiveHeaderHeight,
    showStickyHeader,
    activeTab,
    scrollToSection,
  } = useProductSections();

  /* ============================================================================
   * AUTO SCROLL KHI CÓ ?review=true
   * ========================================================================== */
  useEffect(() => {
    if (searchParams?.get("review") !== "true") return;

    const timer = setTimeout(() => {
      const TAB_BAR_HEIGHT = 48;
      const top =
        (reviewsRef.current?.offsetTop ?? 0) - headerHeight - TAB_BAR_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
    }, 600);

    return () => clearTimeout(timer);
  }, [searchParams, headerHeight]);

  /* ============================================================================
   * STATE
   * ========================================================================== */
  const isInitialLoad = useRef(true);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const init: Record<string, string> = {};
    product.availableOptions?.forEach((opt) => {
      const defaultVal =
        opt.values?.find((v: any) => v.selected) ?? opt.values?.[0];
      if (defaultVal) init[opt.type] = defaultVal.value;
    });
    return init;
  });

  const [availableOptions, setAvailableOptions] = useState(
    product.availableOptions || [],
  );
  const [currentVariant, setCurrentVariant] = useState(product.currentVariant);
  const [variantImages, setVariantImages] = useState(
    product.currentVariant?.images || [],
  );
  const [price, setPrice] = useState(product.price);
  const [quantity, setQuantity] = useState(1);

  /* ============================================================================
   * HANDLERS
   * ========================================================================== */
  const handleOptionChange = (type: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [type]: value }));
  };

  const scrollToReviews = () => scrollToSection("reviews");
  const scrollToSpecifications = () => scrollToSection("specs");

  /* ============================================================================
   * FETCH VARIANT ON OPTION CHANGE
   * ========================================================================== */
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (!Object.keys(selectedOptions).length) return;

    const fetchVariant = async () => {
      try {
        const json = await apiRequest.get<{ data: any }>(
          `/products/slug/${product.slug}/variant`,
          { noAuth: true, params: selectedOptions },
        );
        if (json) {
          setAvailableOptions(json.data.availableOptions);
          setCurrentVariant(json.data.currentVariant);
          setVariantImages(json.data.currentVariant.images);
          setPrice(json.data.price);
          setQuantity(1); // reset quantity khi đổi variant
        }
      } catch (error) {
        console.error("Error fetching variant:", error);
      }
    };

    fetchVariant();
  }, [selectedOptions, product.slug]);

  /* ============================================================================
   * RENDER
   * ========================================================================== */
  return (
    <div>
      {/* ── Sticky Tab Header ─────────────────────────────────────────────── */}
      <div
        style={{ top: effectiveHeaderHeight }}
        className={`fixed left-0 right-0 z-40 bg-neutral-light shadow-md border-b border-neutral
          transition-[top,transform] duration-300 ease-in-out
          ${showStickyHeader ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="container sm:px-6">
          <div className="flex items-center overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`
                  relative px-4 py-3 text-sm font-medium whitespace-nowrap
                  transition-colors cursor-pointer flex-shrink-0
                  ${
                    activeTab === tab.id
                      ? "text-accent"
                      : "text-neutral-darker hover:text-primary"
                  }
                `}
              >
                {tab.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full
                    transition-opacity duration-200
                    ${activeTab === tab.id ? "opacity-100" : "opacity-0"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="container sm:px-6 mt-4" ref={breadcrumbRef}>
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            {
              label: product.category.parent.slug,
              href: `/products/category/${product.category?.slug}`,
            },
            { label: product.name },
          ]}
        />
      </div>

      {/* ── Hero / Thông tin sản phẩm ─────────────────────────────────────── */}
      <div className="sm:px-6 mt-4 sm:mt-6 lg:mt-8 container" ref={infoRef}>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 py-6">
          <div className="w-full lg:w-[60%] lg:sticky lg:top-16 lg:h-fit pr-6">
            <ProductDetailBanner
              product={product}
              selectedVariant={currentVariant}
              images={variantImages}
            />
          </div>
          <div className="w-full lg:w-[40%]">
            <div className="lg:sticky lg:top-16 lg:h-fit pl-6">
              <ProductDetailRight
                product={product}
                selectedVariant={currentVariant}
                selectedPrice={price}
                selectedOptions={selectedOptions}
                availableOptions={availableOptions}
                onOptionChange={handleOptionChange}
                onReviewClick={scrollToReviews}
                onSpecificationClick={scrollToSpecifications}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Thông số kỹ thuật ─────────────────────────────────────────────── */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={specificationsRef}>
        <div className="container !px-0">
          <ProductDetailSection slug={slug} product={product} />
        </div>
      </div>

      {/* ── Bài viết đánh giá ─────────────────────────────────────────────── */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={articleRef}>
        <div className="container !px-0">
          <ProductDetailSection1 product={product} />
        </div>
      </div>

      {/* ── Đánh giá & Hỏi đáp ───────────────────────────────────────────── */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={reviewsRef}>
        <div className="container !px-0">
          <ProductReview
            productId={product.id}
            rating={product.rating}
            slug={product.slug}
            product={product}
          />
        </div>
      </div>

      {/* ── Sản phẩm liên quan ────────────────────────────────────────────── */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={suggestRef}>
        <div className="container !px-0">
          <ProductDetailSuggest slug={slug} />
        </div>
      </div>

      {/* ── Trust Badges ──────────────────────────────────────────────────── */}
      <TrustBadges className="!bg-gray-400/10" />
      
      {/* ── Sticky Footer ─────────────────────────────────────────────────── */}
      <ProductStickyFooter
        product={product}
        selectedVariant={currentVariant}
        selectedPrice={price}
        quantity={quantity}
        infoRef={infoRef}
      />
    </div>
  );
}
