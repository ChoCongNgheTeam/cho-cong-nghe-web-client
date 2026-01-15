"use client";
import { useRef, useState } from "react";
import { BsPatchCheckFill } from "react-icons/bs";
import { HiOutlineRefresh } from "react-icons/hi";
import { FaTruck } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import ProductDetailBanner from "../components/product-detail/product-detail-banner";
import ProductDetailRight from "../components/product-detail/product-detail-card-right";
import ProductDetailSection from "../components/product-detail/product-detail-section";
import ProductDetailSection1 from "../components/product-detail/product-detail-section-1";
import ProductReview from "../components/product-detail/product-detail-review";
import CompareProducts from "../components/product-detail/product-detail-compare";
import ProductDetailSuggest from "../components/product-detail/product-detail-suggest";
import ProductsViewed from "../components/product-detail/products-viewed";

import { ProductDetail } from "@/lib/types/product";

interface ProductDetailContentProps {
  product: ProductDetail;
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Khởi tạo selected color và storage từ availableOptions
  const initialColor =
    product.availableOptions?.find((opt) => opt.attribute === "Color")?.values?.[0]?.value || "";
  const initialStorage =
    product.availableOptions?.find((opt) => opt.attribute === "Storage")?.values?.[0]?.value || "";

  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedStorage, setSelectedStorage] = useState(initialStorage);

  // Tìm variant khớp với color và storage được chọn
  const selectedVariant = product.variants.find((variant) => {
    const colorMatch = product.availableOptions
      ?.find((opt) => opt.attribute === "Color")
      ?.values?.find(
        (val) => val.value === selectedColor && val.variantIds?.includes(variant.id)
      );

    const storageMatch = product.availableOptions
      ?.find((opt) => opt.attribute === "Storage")
      ?.values?.find(
        (val) => val.value === selectedStorage && val.variantIds?.includes(variant.id)
      );

    return colorMatch && storageMatch;
  }) || product.variants[0];

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div>
      {/* Hero Section - Product Info */}
      <div className="container sm:px-6 lg:px-12 mt-4 sm:mt-6 lg:mt-8">
        <div>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 py-6">
            {/* Left - Product Banner */}
            <div className="w-full lg:w-[60%] lg:sticky lg:top-4 lg:h-fit">
              <ProductDetailBanner product={product} selectedVariant={selectedVariant} />
            </div>

            {/* Right - Product Card */}
            <div className="w-full lg:w-[40%]">
              <div className="lg:sticky lg:top-4 lg:h-fit">
                <ProductDetailRight
                  product={product}
                  selectedColor={selectedColor}
                  selectedStorage={selectedStorage}
                  onColorChange={setSelectedColor}
                  onStorageChange={setSelectedStorage}
                  onReviewClick={scrollToReviews}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6 ">
        <ProductDetailSection />
      </div>

      {/* Product Detail Section 1 */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6">
        <ProductDetailSection1 />
      </div>

      {/* Product Review Section */}
      <div className="bg-gray-400/10  pt-4 sm:pt-6 " ref={reviewsRef}>
        <div >
          <ProductReview />
        </div>
      </div>

      {/* Compare Products Section */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6 ">
        <div>
          <CompareProducts />
        </div>
      </div>
      {/* Suggest Products Section */}
      <div className="bg-gray-400/10 pt-4 sm:pt-6 ">
        <div className="container mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductDetailSuggest />
        </div>
      </div>
      <div className="bg-gray-400/10 p-4 sm:pt-6 ">
        <div className="container mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductsViewed />
        </div>
      </div>
      <div className="p-2 sm:pt-6 bg-gray-400/10">
        <div className="container sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12  rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex flex-col gap-2 justify-center items-center">
              <BsPatchCheckFill size={48} className="text-red-500" />
              <div className="text-center">
                <b className="block text-base sm:text-lg">
                  Thương hiệu đảm bảo
                </b>
                <p className="text-sm text-gray-500 mt-1">
                  Nhập khẩu, bảo hành chính hãng
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-center items-center">
              <HiOutlineRefresh size={48} className="text-red-500" />
              <div className="text-center">
                <b className="block text-base sm:text-lg">Đổi trả dễ dàng</b>
                <p className="text-sm text-gray-500 mt-1">
                  Theo chính sách đổi trả tại ChoCongNghe
                </p>
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
                <b className="block text-base sm:text-lg">
                  Sản phẩm chất lượng
                </b>
                <p className="text-sm text-gray-500 mt-1">
                  Đảm bảo tương thích và độ bền cao
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
