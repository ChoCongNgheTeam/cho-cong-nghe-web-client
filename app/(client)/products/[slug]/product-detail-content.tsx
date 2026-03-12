"use client";
import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { BsPatchCheckFill } from "react-icons/bs";
import { HiOutlineRefresh } from "react-icons/hi";
import { FaTruck } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

import ProductDetailBanner from "../components/product-detail/product-detail-banner";
import ProductDetailRight from "../components/product-detail/product-detail-card-right";
import ProductDetailSection from "../components/product-detail/product-detail-section";
import ProductDetailSection1 from "../components/product-detail/product-detail-section-1";
// import ProductReview from "../components/product-detail/product-detail-review";

import ProductDetailSuggest from "../components/product-detail/product-detail-suggest";
import ProductReview from "../product-comment/Productreview";

import Breadcrumb from "../../../components/layout/Breadcrumb/Breadcrumb";

import { ProductDetail } from "@/lib/types/product";
import apiRequest from "@/lib/api";

interface ProductDetailContentProps {
  product: ProductDetail;
  slug: string;
}

export function ProductDetailContent({ product, slug }: ProductDetailContentProps) {
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
   * REFS
   * ========================================================================== */
  const reviewsRef = useRef<HTMLDivElement>(null);
  const specifications = useRef<HTMLDivElement>(null);

  /* ============================================================================
   * INITIAL OPTIONS - MEMOIZED
   * ========================================================================== */
  const colors = useMemo(() => product.availableOptions?.find((opt) => opt.type === "color")?.values || [], [product.availableOptions]);

  const storages = useMemo(() => product.availableOptions?.find((opt) => opt.type === "storage")?.values || [], [product.availableOptions]);

  /* ============================================================================
   * STATE
   * ========================================================================== */
  const [selectedColor, setSelectedColor] = useState(colors[0]?.value || "");
  const [selectedStorage, setSelectedStorage] = useState(storages[0]?.value || "");
  const [isUserSelectStorage, setIsUserSelectStorage] = useState(false);
  const [availableOptions, setAvailableOptions] = useState(product.availableOptions || []);
  const [currentVariant, setCurrentVariant] = useState(product.currentVariant);
  const [variantImages, setVariantImages] = useState(product.currentVariant?.images || []);
  const [price, setPrice] = useState(product.price);

  /* ============================================================================
   * HANDLERS
   * ========================================================================== */
  const handleColorChange = (color: string) => {
    setSelectedColor(color);

    // Nếu user CHƯA chọn storage → reset về mặc định
    if (!isUserSelectStorage) {
      setSelectedStorage(storages[0]?.value || "");
    }
  };

  const handleStorageChange = (storage: string) => {
    setIsUserSelectStorage(true);
    setSelectedStorage(storage);
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToSpecifications = () => {
    specifications.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* ============================================================================
   * FETCH VARIANT ON COLOR/STORAGE CHANGE
   * ========================================================================== */
  useEffect(() => {
    if (!selectedColor || !selectedStorage) return;

    const fetchVariant = async () => {
      try {
        const json = await apiRequest.get<{ data: any }>(`/products/slug/${product.slug}/variant`, {
          noAuth: true,
          params: { color: selectedColor, storage: selectedStorage },
        });

        if (json) {
          setAvailableOptions(json.data.availableOptions);
          setCurrentVariant(json.data.currentVariant);
          setVariantImages(json.data.currentVariant.images);
          setPrice(json.data.price);
        }
      } catch (error) {
        console.error("Error fetching variant:", error);
      }
    };

    fetchVariant();
  }, [selectedColor, selectedStorage, product.slug]);

  /* ============================================================================
   * DEBUG LOGS (Optional - Remove in production)
   * ========================================================================== */
  useEffect(() => {
    console.log("Selected:", {
      color: selectedColor,
      storage: selectedStorage,
    });
  }, [selectedColor, selectedStorage]);

  /* ============================================================================
   * RENDER
   * ========================================================================== */
  return (
    <div>
      {/* Breadcrumb */}
      <div className="container sm:px-6 mt-4">
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

      {/* Hero Section - Product Info */}
      <div className="sm:px-6 mt-4 sm:mt-6 lg:mt-8 container">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 py-6">
          {/* Left - Product Banner */}
          <div className="w-full lg:w-[60%] lg:sticky lg:top-4 lg:h-fit">
            <ProductDetailBanner product={product} selectedVariant={currentVariant} images={variantImages} />
          </div>

          {/* Right - Product Card */}
          <div className="w-full lg:w-[40%]">
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <ProductDetailRight
                product={product}
                selectedVariant={currentVariant}
                selectedPrice={price}
                selectedColor={selectedColor}
                selectedStorage={selectedStorage}
                availableOptions={availableOptions}
                onColorChange={handleColorChange}
                onStorageChange={handleStorageChange}
                onReviewClick={scrollToReviews}
                onSpecificationClick={scrollToSpecifications}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={specifications}>
        <div className="!px-0">
          <ProductDetailSection slug={slug} product={product} />
        </div>
      </div>

      {/* Product Detail Section 1 */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6 ">
        <ProductDetailSection1 product={product} />
      </div>

      {/* Product Review Section */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6" ref={reviewsRef}>
        <div>
          <ProductReview productId={product.id} />
        </div>
      </div>

      {/* Compare Products Section */}
      {/* <div className="bg-gray-400/10 pt-4 sm:pt-6">
        <div>
          <CompareProducts />
        </div>
      </div> */}

      {/* Suggest Products Section */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6">
        <div>
          <ProductDetailSuggest slug={slug} />
        </div>
      </div>

      {/* Products Viewed */}
      {/* <div className="bg-gray-400/10 p-4 sm:pt-6">
        <div className="mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductsViewed />
        </div>
      </div> */}

      {/* Trust Badges */}
      <div className="p-2 sm:pt-6 bg-gray-400/10">
        <div className="sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex flex-col gap-2 justify-center items-center">
              <BsPatchCheckFill size={48} className="text-red-500" />
              <div className="text-center">
                <b className="block text-base sm:text-lg">Thương hiệu đảm bảo</b>
                <p className="text-sm text-gray-500 mt-1">Nhập khẩu, bảo hành chính hãng</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-center items-center">
              <HiOutlineRefresh size={48} className="text-red-500" />
              <div className="text-center">
                <b className="block text-base sm:text-lg">Đổi trả dễ dàng</b>
                <p className="text-sm text-gray-500 mt-1">Theo chính sách đổi trả tại ChoCongNghe</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-center items-center">
              <FaTruck size={48} className="text-red-500" />
              <div className="text-center">
                <b className="block text-base sm:text-lg">Giao hàng tận nơi</b>
                <p className="text-sm text-gray-500 mt-1">Trên toàn quốc</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-center items-center">
              <MdVerified size={48} className="text-red-500" />
              <div className="text-center">
                <b className="block text-base sm:text-lg">Sản phẩm chất lượng</b>
                <p className="text-sm text-gray-500 mt-1">Đảm bảo tương thích và độ bền cao</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
