'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CategoryDTO } from '@/lib/api-demo';
import { useRef } from 'react';

interface CategoryGridProps {
  categories: CategoryDTO[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-neutral-light">
      <div className="container mx-auto px-4">
        {/* Outer Container with Border */}
        <div className="bg-white rounded-3xl border-2 border-neutral-hover p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              Danh mục nổi bật
            </h2>
          </div>

          {/* Categories Container with Navigation Arrows */}
          <div className="relative group">
            {/* Left Arrow - Only visible on hover */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white border border-neutral-hover hover:border-promotion hover:text-promotion shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow - Only visible on hover */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white border border-neutral-hover hover:border-promotion hover:text-promotion shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Categories Grid - Fixed 8 items visible */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-hidden scrollbar-hide scroll-smooth"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div className="flex gap-3 md:gap-4">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group flex-shrink-0"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                      width: 'calc((100% - 7 * 12px) / 8)', // 8 items with gap
                    }}
                  >
                    <div className="flex flex-col items-center">
                      {/* Category Card - Simple white background */}
                      <div className="relative w-full bg-white rounded-2xl p-3 md:p-4 transition-all duration-300 group-hover:scale-105">
                        {/* Category Image */}
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-light">
                          <Image
                            src={category.image_path}
                            alt={category.name}
                            fill
                            className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      </div>

                      {/* Category Name - Below image */}
                      <p className="mt-3 text-center text-xs md:text-sm font-semibold text-primary group-hover:text-promotion transition-colors duration-300 line-clamp-2 px-1">
                        {category.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .group.flex-shrink-0 {
            width: calc((100% - 3 * 12px) / 4) !important;
          }
        }
      `}</style>
    </section>
  );
}