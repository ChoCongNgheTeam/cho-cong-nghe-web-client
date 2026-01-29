// components/home/page.tsx
"use client";

import React from 'react';
import HeroBanner from './HeroBanner';
import CategorySection from './CategorySection';
import FlashSaleSection from './FlashSaleSection';
import DealOnlineSection from './DealOnlineSection';
import SuggestionSection from './SuggestionSection';
import RecentlyViewedSection from './RecentlyViewedSection';
import ServiceSection from './ServiceSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-accent to-accent-hover py-2 text-center text-primary text-sm font-medium">
        🎊 Tết Tốt Bất Lại Tết - Thu Cũ Đổi Mới Trợ Giá 26 Triệu 🎊
      </div>

      <div className="container mx-auto py-4 sm:py-6">
        <HeroBanner />
        <CategorySection />
        <FlashSaleSection />
        <DealOnlineSection />
        <SuggestionSection />
        <RecentlyViewedSection />
        <ServiceSection />
      </div>
    </div>
  );
}