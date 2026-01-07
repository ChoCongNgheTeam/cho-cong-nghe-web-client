"use client";

import { slides } from "@/data/slides";
import { smallBanners } from "@/data/smallBanners";

type Props = {
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
};

export default function CarouselBanner({
  currentSlide,
  setCurrentSlide,
  nextSlide,
  prevSlide,
}: Props) {
  return (
    <section className="w-full mb-10">
      {/* ===== BANNER LỚN ===== */}
      <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden rounded-xl">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 flex items-center">
              <div className="ml-6 sm:ml-12 max-w-xl text-white">
                <h2 className="text-2xl sm:text-4xl font-bold mb-3">
                  {slide.title}
                </h2>
                <p className="text-sm sm:text-lg mb-6">
                  {slide.description}
                </p>
                <button className="px-5 py-2.5 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition">
                  {slide.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20
          w-10 h-10 rounded-full bg-white/70 hover:bg-white transition"
        >
          ‹
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20
          w-10 h-10 rounded-full bg-white/70 hover:bg-white transition"
        >
          ›
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentSlide
                  ? "bg-yellow-400"
                  : "bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ===== BANNER NHỎ BÊN DƯỚI ===== */}
      <div className="container mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {smallBanners.map((banner) => (
          <a
            key={banner.id}
            href={banner.link}
            className="block overflow-hidden rounded-xl group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.image}
              alt={banner.alt}
              className="w-full h-35 sm:h-45 object-cover
              group-hover:scale-105 transition duration-300"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
