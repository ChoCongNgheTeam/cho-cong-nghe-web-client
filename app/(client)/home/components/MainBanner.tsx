'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BannerDTO } from '@/lib/api-demo';

interface MainBannerProps {
  banners: BannerDTO[];
}

export default function MainBanner({ banners }: MainBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, banners.length]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden group">
      {/* Main slider container */}
      <div className="relative aspect-[21/9] md:aspect-[21/7] lg:aspect-[21/6] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Slides */}
        {banners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.link_url}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              index === currentSlide
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 z-0'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={banner.image_path}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
                quality={90}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
              
              {/* Title overlay */}
              <div className="absolute inset-0 flex items-end p-8 md:p-12 lg:p-16">
                <div className="max-w-2xl">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-neutral-light mb-4 drop-shadow-2xl tracking-tight leading-tight">
                    {banner.title}
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="inline-block px-6 py-2 bg-promotion text-neutral-light font-bold rounded-full text-sm md:text-base hover:bg-promotion-hover transition-colors">
                      Khám phá ngay
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-neutral-light/90 hover:bg-neutral-light shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <svg
          className="w-6 h-6 text-primary-hover"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-neutral-light/90 hover:bg-neutral-light shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <svg
          className="w-6 h-6 text-primary-hover"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-10 h-2.5 bg-promotion'
                : 'w-2.5 h-2.5 bg-neutral-light/60 hover:bg-neutral-light/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}