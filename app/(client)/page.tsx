"use client";
import { useState } from "react";
import CarouselBanner from "@/components/home/CarouselBanner";
import HotSaleSection from "@/components/home/HotSaleSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import AccessoriesSection from "@/components/home/AccessoriesSection";
import ComputerPartsSection from "@/components/home/ComputerPartsSection";
import ReviewsSection from "@/components/home/ReviewsSection";

import NewsSection from "@/components/home/NewsSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import { slides } from "@/data/slides";
import TetPromoSection from "@/components/home/TetPromoSection";
import ViewedProductsSection from "@/components/home/ViewedProductsSection";

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

      <div className="container mx-auto">
        <FeaturedCategories />
        <HotSaleSection />
        <TetPromoSection/>
        <FeaturedProductsSection />
        <AccessoriesSection />
        <ComputerPartsSection />
        <HotSaleSection />
        <HotSaleSection />
        <ReviewsSection />
        <NewsSection />
        <ViewedProductsSection/>
      </div>
    </div>
  );
}
