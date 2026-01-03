"use client";
import { useRef } from "react";
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

export function ProductDetailContent() {
  const reviewsRef = useRef<HTMLDivElement>(null);
  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div>
      {/* Hero Section - Product Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-4 sm:mt-6 lg:mt-8">
        <div>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 py-6">
            {/* Left - Product Banner */}
            <div className="w-full lg:w-[60%] lg:sticky lg:top-4 lg:h-fit">
              <ProductDetailBanner />
            </div>

            {/* Right - Product Card */}
            <div className="w-full lg:w-[40%]">
              <div className="lg:sticky lg:top-4 lg:h-fit">
                <ProductDetailRight onReviewClick={scrollToReviews} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="bg-gray-500/10 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductDetailSection />
        </div>
      </div>

      {/* Product Detail Section 1 */}
      <div className="bg-gray-500/10 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductDetailSection1 />
        </div>
      </div>

      {/* Product Review Section */}
      <div className="bg-gray-500/10  pt-4 sm:pt-6 " ref={reviewsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductReview />
        </div>
      </div>

      {/* Compare Products Section */}
      <div className="bg-gray-500/10 pt-4 sm:pt-6 ">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <CompareProducts />
        </div>
      </div>
      {/* Suggest Products Section */}
      <div className="bg-gray-500/10 pt-4 sm:pt-6 ">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductDetailSuggest />
        </div>
      </div>
      <div className="bg-gray-500/10 p-4 sm:pt-6 ">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductsViewed />
        </div>
      </div>
      <div className="p-2 sm:pt-6 bg-gray-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12  rounded-lg">
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
