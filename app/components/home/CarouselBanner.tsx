"use client";

import { slides } from "@/data/slides";

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
    <section className="relative w-full h-[400px] overflow-hidden mb-10">
      {/* SLIDES */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* IMAGE */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/40 flex items-center">
            <div className="ml-12 max-w-xl text-white">
              <h2 className="text-4xl font-bold mb-3">{slide.title}</h2>
              <p className="text-lg mb-6">{slide.description}</p>
              <button className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition">
                {slide.buttonText}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* PREV */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20
        w-10 h-10 rounded-full bg-white/70 hover:bg-white transition"
      >
        ‹
      </button>

      {/* NEXT */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20
        w-10 h-10 rounded-full bg-white/70 hover:bg-white transition"
      >
        ›
      </button>

      {/* DOTS */}
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
    </section>
  );
}
