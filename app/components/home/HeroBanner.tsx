// components/home/HeroBanner.tsx
"use client";

import React from 'react';
import Slidezy from '@/components/Slider/Slidezy';

const bannerImages = [
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=400&fit=crop',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=400&fit=crop'
];

export default function HeroBanner() {
  return (
    <div className="mb-6">
      <Slidezy
        items={1}
        speed={500}
        autoplay={true}
        autoplayTimeout={5000}
        loop={true}
        nav={true}
        controls={true}
        className="rounded-lg overflow-hidden"
      >
        {bannerImages.map((img, idx) => (
          <div key={idx} className="aspect-[21/9] sm:aspect-[21/6]">
            <img
              src={img}
              alt={`Banner ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </Slidezy>
    </div>
  );
}