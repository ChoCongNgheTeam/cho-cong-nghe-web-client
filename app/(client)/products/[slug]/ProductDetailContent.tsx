"use client";

import { useRef, useState, useEffect, useCallback, startTransition, useMemo, memo } from "react";
import { useSearchParams, usePathname } from "next/navigation";

import ProductDetailBanner from "../components/ProductDetail/ProductDetailBanner";
import ProductDetailRight from "../components/ProductDetail/ProductDetailCardRight";
import ProductDetailSection from "../components/ProductDetail/ProductSpecifications";
import ProductDetailSection1 from "../components/ProductDetail/ProductDescription";
import ProductDetailSuggest from "../components/ProductDetail/ProductDetailSuggest";
import ProductReview from "../components/ProductComment/ProductReview";
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

interface VariantOptionValueWithSelected {
  value: string;
  label?: string;
  selected?: boolean;
}

function syncOptionsFromVariant(variant: ProductVariant | undefined, availableOptions: VariantOption[]): Record<string, string> {
  if (!variant) return {};

  const result: Record<string, string> = {};

  for (const opt of availableOptions) {
    if (opt.type === "bundle") {
      const selected = opt.values?.find((v) => (v as VariantOptionValueWithSelected).selected === true);
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
      if (opt.values?.[0]) result[opt.type] = opt.values[0].value;
    }
  }

  return result;
}

// StaticSections nhận refs trực tiếp thay vì destructure từ object mới mỗi lần
const StaticSections = memo(function StaticSections({
  slug,
  product,
  layoutChangingRef,
  specificationsRef,
  articleRef,
  reviewsRef,
  suggestRef,
}: {
  slug: string;
  product: ProductDetail;
  layoutChangingRef: React.MutableRefObject<boolean>;
  specificationsRef: React.RefObject<HTMLDivElement | null>;
  articleRef: React.RefObject<HTMLDivElement | null>;
  reviewsRef: React.RefObject<HTMLDivElement | null>;
  suggestRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={specificationsRef}>
        <div className="container !px-0">
          <ProductDetailSection slug={slug} product={product} />
        </div>
      </div>
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={articleRef}>
        <div className="container !px-0">
          <ProductDetailSection1 product={product} layoutChangingRef={layoutChangingRef} />
        </div>
      </div>
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={reviewsRef}>
        <div className="container !px-0">
          <ProductReview productId={product.id} rating={product.rating} slug={product.slug} product={product} />
        </div>
      </div>
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={suggestRef}>
        <div className="container !px-0">
          <ProductDetailSuggest slug={slug} />
        </div>
      </div>
      <TrustBadges className="!bg-gray-400/10" />
    </>
  );
});

export function ProductDetailContent({ product, slug }: ProductDetailContentProps) {
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // useProductSections giờ return stable object (useMemo deps=[])
  const { breadcrumbRef, infoRef, specificationsRef, articleRef, reviewsRef, suggestRef, scrollToSection, layoutChangingRef } = useProductSections(stickyBarRef, tabBarRef);

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Stable callbacks — scrollToSection từ hook đã stable
  const handleReviewClick = useCallback(() => scrollToSection("reviews"), [scrollToSection]);
  const handleSpecClick = useCallback(() => scrollToSection("specs"), [scrollToSection]);

  /* ── Variant state ── */
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() =>
    syncOptionsFromVariant(product.currentVariant as unknown as ProductVariant, (product.availableOptions as VariantOption[]) || []),
  );
  const [availableOptions, setAvailableOptions] = useState<VariantOption[]>((product.availableOptions as VariantOption[]) || []);
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | undefined>(product.currentVariant as unknown as ProductVariant);
  const [price, setPrice] = useState<ProductPrice | undefined>(product.price);

  // Dùng refs để đọc latest value trong callbacks mà không tạo deps
  const selectedOptionsRef = useRef(selectedOptions);
  useEffect(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  const currentVariantRef = useRef(currentVariant);
  useEffect(() => {
    currentVariantRef.current = currentVariant;
  }, [currentVariant]);

  // variantImages stable theo currentVariant.id
  const variantImages = useMemo(
    () => currentVariant?.images?.map((img) => ({ imageUrl: img.imageUrl })) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentVariant?.id],
  );

  // fetchVariantByParams chỉ depend product.slug — stable
  const fetchVariantByParams = useCallback(
    async (params: Record<string, string>) => {
      try {
        const data = await getProductVariant(product.slug, params);

        setAvailableOptions(data.availableOptions as VariantOption[]);
        setCurrentVariant(data.currentVariant);
        setPrice(data.price);

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

    startTransition(() => {
      fetchVariantByParams({ bundle: bundleId }).then(cleanUrl);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handleOptionChange không còn depend selectedOptions
  // Đọc giá trị latest qua selectedOptionsRef thay vì closure
  const handleOptionChange = useCallback(
    async (type: string, value: string) => {
      if (type === "bundle") {
        await fetchVariantByParams({ bundle: value });
      } else {
        const { bundle: _drop, ...restOptions } = selectedOptionsRef.current;
        await fetchVariantByParams({ ...restOptions, [type]: value });
      }
    },
    [fetchVariantByParams], // ← không còn selectedOptions trong deps
  );

  // handleColorChangeFromGallery không còn depend currentVariant?.id
  // Đọc giá trị latest qua currentVariantRef
  const handleColorChangeFromGallery = useCallback(
    async (variantId: string) => {
      if (variantId === currentVariantRef.current?.id) return;
      await fetchVariantByParams({ bundle: variantId });
    },
    [fetchVariantByParams], // ← không còn currentVariant?.id trong deps
  );

  return (
    <div>
      {/* ── Sticky Tab Bar ── */}
      <div
        ref={stickyBarRef}
        className="fixed left-0 right-0 z-40 bg-neutral-light shadow-md border-b border-neutral"
        style={{
          top: 0,
          transform: `translateY(var(--header-translate, 0px))`,
          transition: "opacity 0.2s ease, transform 0.3s ease-in-out",
          height: 48,
          opacity: 0,
          pointerEvents: "none",
          visibility: "hidden",
        }}
      >
        <div className="container sm:px-6 h-full">
          <div ref={tabBarRef} className="flex items-center h-full overflow-x-auto [scrollbar-width:none]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`
                  relative px-4 py-3 text-sm font-medium whitespace-nowrap h-full
                  transition-colors cursor-pointer flex-shrink-0
                  ${tab.id === "info" ? "text-accent" : "text-neutral-darker"}
                `}
              >
                {tab.label}
                <span data-indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full transition-opacity duration-200" style={{ opacity: tab.id === "info" ? 1 : 0 }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="container sm:px-6 mt-4" ref={breadcrumbRef}>
        {/* <Breadcrumb items={[...]} /> */}
      </div>

      {/* ── Hero / Thông tin sản phẩm ── */}
      <div className="sm:px-6 mt-4 sm:mt-6 lg:mt-8 container" ref={infoRef}>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 py-6">
          <div className="w-full lg:w-[60%] lg:sticky lg:top-16 lg:h-fit">
            {/* Bỏ key={currentVariant?.id} — tránh unmount/remount toàn bộ component */}
            <ProductDetailBanner product={product} selectedVariant={currentVariant} images={variantImages} onColorChange={handleColorChangeFromGallery} />
          </div>
          <div className="w-full lg:w-[40%]">
            <div className="lg:sticky lg:top-16 lg:h-fit">
              {/* Bỏ key={currentVariant?.id} — props thay đổi sẽ trigger update bên trong */}
              <ProductDetailRight
                product={product}
                selectedVariant={currentVariant}
                selectedPrice={price}
                selectedOptions={selectedOptions}
                availableOptions={availableOptions}
                onOptionChange={handleOptionChange}
                onReviewClick={handleReviewClick}
                onSpecificationClick={handleSpecClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* StaticSections nhận props stable — sẽ không re-render khi variant thay đổi */}
      <StaticSections
        slug={slug}
        product={product}
        layoutChangingRef={layoutChangingRef}
        specificationsRef={specificationsRef}
        articleRef={articleRef}
        reviewsRef={reviewsRef}
        suggestRef={suggestRef}
      />

      <ProductStickyFooter product={product} selectedVariant={currentVariant} selectedPrice={price} infoRef={infoRef} availableOptions={availableOptions} selectedOptions={selectedOptions} />
    </div>
  );
}
