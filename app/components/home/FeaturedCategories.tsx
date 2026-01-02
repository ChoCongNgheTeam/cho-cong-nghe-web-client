"use client";

import { useRef } from "react";
import { categories } from "@/data/categories";

export default function FeaturedCategories() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const CARD_WIDTH = 116; // 100px width + 16px gap

  const handlePrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: sliderRef.current.scrollLeft - CARD_WIDTH,
        behavior: 'smooth',
      });
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: sliderRef.current.scrollLeft + CARD_WIDTH,
        behavior: 'smooth',
      });
    }
  };

  // Lấy 16 danh mục nổi bật đầu tiên
  const featuredCategories = categories.slice(0, 16);

  return (
    <section className="py-8 bg-white mb-6 rounded-lg shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">
          Danh mục nổi bật
        </h2>

        {/* SLIDER WRAPPER */}
        <div className="relative group">
          {/* LEFT BUTTON */}
          <button
            onClick={handlePrev}
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

          {/* SCROLL HORIZONTAL */}
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-3"
          >
            {featuredCategories.map((cat) => (
              <div
                key={cat.id}
                className="
                  flex-shrink-0
                  w-[100px]
                  flex flex-col items-center justify-center
                  bg-gray-50 hover:bg-gray-100
                  rounded-lg p-4
                  cursor-pointer
                  transition
                  snap-start
                "
              >
                <span className="text-4xl mb-2">{cat.icon}</span>
                <span className="text-xs sm:text-sm text-center">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
