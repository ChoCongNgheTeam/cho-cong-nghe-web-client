"use client";
import { useState } from "react";
import CarouselBanner from "@/components/home/CarouselBanner";
import HotSaleSection from "@/components/home/HotSaleSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import AccessoriesSection from "@/components/home/AccessoriesSection";
import ComputerPartsSection from "@/components/home/ComputerPartsSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import BrandsSection from "@/components/home/BrandsSection";
import NewsSection from "@/components/home/NewsSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import { slides } from "@/data/slides";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="bg-gray-50 min-h-screen">
      <CarouselBanner
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        nextSlide={nextSlide}
        prevSlide={prevSlide}
      />

      <div className="max-w-7xl mx-auto">
        <FeaturedCategories />
        <HotSaleSection />
        <FeaturedProductsSection />
        <AccessoriesSection />
        <ComputerPartsSection />
        <BrandsSection />
        <ReviewsSection />
        <NewsSection />
      </div>
    </div>
  );
}
