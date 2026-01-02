"use client";

import { useRef, useState } from "react";
import { featuredProducts } from "../../data/featuredProducts";
import ProductCard from "./ProductCard";

export default function FeaturedProductsSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const CARD_WIDTH = 260 + 16; // card width + gap
  const MAX_INDEX = featuredProducts.length - 1;

  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollTo({
      left: index * CARD_WIDTH,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    if (activeIndex > 0) scrollToIndex(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < MAX_INDEX) scrollToIndex(activeIndex + 1);
  };

  return (
    <section className="py-8 mb-6 bg-white rounded-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Sản phẩm nổi bật</h2>
          <a
            href="#featured"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Xem tất cả →
          </a>
        </div>

        {/* SLIDER WRAPPER */}
        <div className="relative group">
          {/* LEFT BUTTON */}
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="
              absolute
              left-0
              top-1/2
              -translate-y-1/2
              z-10
              w-10 h-10
              rounded-full
              bg-white
              shadow
              flex items-center justify-center
              disabled:opacity-30
              opacity-0
              pointer-events-none
              transition-all
              duration-300
              group-hover:opacity-100
              group-hover:pointer-events-auto
            "
          >
            ◀
          </button>

          {/* RIGHT BUTTON */}
          <button
            onClick={handleNext}
            disabled={activeIndex === MAX_INDEX}
            className="
              absolute
              right-0
              top-1/2
              -translate-y-1/2
              z-10
              w-10 h-10
              rounded-full
              bg-white
              shadow
              flex items-center justify-center
              disabled:opacity-30
              opacity-0
              pointer-events-none
              transition-all
              duration-300
              group-hover:opacity-100
              group-hover:pointer-events-auto
            "
          >
            ▶
          </button>

          {/* SLIDER */}
          <div
            ref={sliderRef}
            className="
              flex
              gap-4
              overflow-x-auto
              scroll-smooth
              -mx-2 px-2
              snap-x snap-mandatory
            "
          >
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[240px] sm:w-[260px] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
