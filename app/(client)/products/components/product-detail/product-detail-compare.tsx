"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Search } from "lucide-react";
import ProductCompareModal from "./product-compare-modal";

export default function ProductComparison() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompareProducts, setSelectedCompareProducts] = useState<
    Product[]
  >([]);
  // types/product.ts
  interface Product {
    id: number;
    name: string;
    price: string;
    oldPrice?: string;
    image: string;
    screenSize?: string;
    battery?: string;
    status?: string;
    isFixed?: boolean;
    hasDetails?: boolean;
  }

  const products: Product[] = [
    {
      id: 1,
      name: "Nubia A76 4GB 128GB (NFC)",
      price: "2.290.000đ",
      oldPrice: "2.490.000đ",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/180x0/filters:format(webp):quality(75)/nubia_a76_den_5_26e8fd922b.jpg",
      status: "Sản phẩm đang xem",
      screenSize: "6.75 inch",
      battery: "5000 mAh",
      isFixed: true,
    },
    {
      id: 2,
      name: "Tecno Spark Go 2 4GB 64GB",
      price: "2.390.000đ",
      oldPrice: "2.690.000đ",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/180x0/filters:format(webp):quality(75)/zte_blade_a55_xanh_1_504f66df65.jpg",
      hasDetails: true,
      screenSize: "6.67 inch",
      battery: "5000 mAh",
    },
    {
      id: 3,
      name: "Benco V91c 4GB 128GB",
      price: "2.090.000đ",
      oldPrice: "2.690.000đ",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/180x0/filters:format(webp):quality(75)/tecno_spark_go_1_den_5_427fd0befc.jpg",
      hasDetails: true,
      screenSize: "6.56 inch",
      battery: "5000 mAh",
    },
    {
      id: 4,
      name: "Tecno Spark Go 1 4GB 64GB",
      price: "1.860.000đ",
      oldPrice: "2.460.000đ",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/180x0/filters:format(webp):quality(75)/tecno_spark_go_1_den_5_427fd0befc.jpg",
      hasDetails: true,
      screenSize: "6.67 inch",
      battery: "5000 mAh",
    },
    {
      id: 5,
      name: "Honor Play 10 4GB 128GB",
      price: "2.190.000đ",
      oldPrice: "2.290.000đ",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/180x0/filters:format(webp):quality(75)/benco_v91c_xanh_5_17c1bd5119.jpg",
      hasDetails: true,
      screenSize: "6.74 inch",
      battery: "5000 mAh",
    },
    {
      id: 6,
      name: "Samsung Galaxy A15 4GB 128GB",
      price: "3.490.000đ",
      oldPrice: "3.990.000đ",
      image:
        "https://cdn2.fptshop.com.vn/unsafe/180x0/filters:format(webp):quality(75)/honor_x5b_xanh_3_07413a1fe9.jpg",
      hasDetails: true,
      screenSize: "6.5 inch",
      battery: "5000 mAh",
    },
  ];

  // ============= Cấu hình responsiveness =============
  const BREAKPOINTS = {
    mobile: { max: 640, visibleCount: 2 },
    tablet: { max: 1024, visibleCount: 3 },
    desktop: { visibleCount: 5 },
  };

  const getVisibleCountByDeviceSize = (windowWidth = 0) => {
    if (windowWidth < BREAKPOINTS.mobile.max)
      return BREAKPOINTS.mobile.visibleCount;
    if (windowWidth < BREAKPOINTS.tablet.max)
      return BREAKPOINTS.tablet.visibleCount;
    return BREAKPOINTS.desktop.visibleCount;
  };

  // ============= Hook quản lý số lượng hiển thị =============
  const getInitialVisibleCount = () => {
    if (typeof window === "undefined") return BREAKPOINTS.desktop.visibleCount;
    return getVisibleCountByDeviceSize(window.innerWidth);
  };

  const [visibleCount, setVisibleCount] = useState(getInitialVisibleCount());

  useEffect(() => {
    const handleWindowResize = () => {
      setVisibleCount(getVisibleCountByDeviceSize(window.innerWidth));
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  // ============= Tính toán sản phẩm hiển thị =============
  // Sản phẩm đầu tiên luôn được ghim, các sản phẩm còn lại cuộn theo vị trí hiện tại
  const firstProduct = products[0];
  const scrollableProducts = products.slice(
    currentIndex + 1,
    currentIndex + visibleCount,
  );
  const visibleProducts = [firstProduct, ...scrollableProducts];

  // ============= Điều khiển điều hướng =============
  const maxSlideIndex = products.length - visibleCount;
  const canNavigateToPrevious = currentIndex > 0;
  const canNavigateToNext = currentIndex < maxSlideIndex;

  const handleNavigatePrevious = () => {
    if (canNavigateToPrevious) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleNavigateNext = () => {
    if (canNavigateToNext) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Giữ tên cũ cho compatibility với JSX
  const handlePrev = handleNavigatePrevious;
  const handleNext = handleNavigateNext;
  const canGoPrev = canNavigateToPrevious;
  const canGoNext = canNavigateToNext;

  // ============= Quản lý modal so sánh =============
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompareProducts([]);
  };

  const handleAddProduct = (product: Product) => {
    setSelectedCompareProducts((prev) => [...prev, product]);
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedCompareProducts((prev) =>
      prev.filter((p) => p.id !== productId),
    );
  };

  const handleCompare = () => {
    console.log("So sánh sản phẩm:", selectedCompareProducts);
    // TODO: Implement comparison logic
    handleCloseModal();
  };

  return (
    <div className="container mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-neutral-light rounded-lg">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
              So sánh sản phẩm tương tự
            </h2>
            <button className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-accent rounded-full text-xs sm:text-sm font-medium hover:bg-accent-light transition-colors">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
              Gợi ý bởi AI
            </button>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 text-accent hover:text-accent-hover text-sm sm:text-base px-4 py-2 bg-neutral rounded-full cursor-pointer hover:bg-neutral-dark transition-colors"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Tìm sản phẩm khác để so sánh</span>
          </button>
        </div>

        {/* Products Grid */}
        <div className="relative">
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {visibleProducts.map((product, index) => (
              <div
                key={product.id}
                className={`bg-neutral-light rounded-lg p-2 sm:p-3 lg:p-4 ${
                  product.isFixed
                    ? "shadow-[2px_0_18px_-4px_rgba(0,0,0,0.25)]"
                    : "border border-neutral-dark"
                } transition-all duration-300`}
              >
                {/* Product Image */}
                <div className="aspect-square rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={product.image}
                    alt=""
                    className="w-[80%] h-[80%] object-cover"
                  />
                </div>
                {/* Product Name */}
                <h3 className="font-medium text-xs sm:text-sm mb-2 sm:mb-3 h-8 sm:h-10 line-clamp-2 text-primary">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mb-2 sm:mb-3">
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-promotion mb-1">
                    {product.price}
                  </div>
                  {product.oldPrice && (
                    <div className="text-xs sm:text-sm text-neutral-darker line-through">
                      {product.oldPrice}
                    </div>
                  )}
                </div>

                {/* Status/Action Button */}
                <div className="mb-2 sm:mb-3 lg:mb-4">
                  {product.isFixed ? (
                    <div className="text-xs sm:text-sm text-neutral-darker py-1.5 sm:py-2">
                      {product.status}
                    </div>
                  ) : (
                    <button className="w-full text-accent text-xs sm:text-sm font-medium hover:text-accent-hover py-1.5 sm:py-2 text-left cursor-pointer">
                      So sánh chi tiết →
                    </button>
                  )}
                </div>

                {/* Specs */}
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm border-t border-neutral-dark pt-2 sm:pt-3">
                  <div>
                    <div className="font-medium text-primary mb-1">
                      Kích thước màn hình
                    </div>
                    <div className="text-neutral-darker">
                      {product.screenSize}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-primary mb-1">
                      Dung lượng pin
                    </div>
                    <div className="text-neutral-darker">{product.battery}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {canGoPrev && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-neutral-light rounded-full shadow-lg flex items-center justify-center hover:bg-neutral transition-colors z-10"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            </button>
          )}

          {canGoNext && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-neutral-light rounded-full shadow-lg flex items-center justify-center hover:bg-neutral transition-colors z-10"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            </button>
          )}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
          {Array.from({ length: products.length - (visibleCount - 1) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? "bg-accent w-4 sm:w-6"
                    : "bg-neutral-dark hover:bg-neutral-darker"
                }`}
              />
            ),
          )}
        </div>

        {/* Product Compare Modal */}
        <ProductCompareModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          allProducts={products}
          currentProduct={products[0]}
          selectedProducts={selectedCompareProducts}
          onAddProduct={handleAddProduct}
          onRemoveProduct={handleRemoveProduct}
          onCompare={handleCompare}
        />
      </div>
    </div>
  );
}
