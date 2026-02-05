// components/shared/ProductCard.tsx
"use client";

import React from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  ratingCount?: number;
  discount?: number;
  onClick?: () => void;
}

export default function ProductCard({ 
  name, 
  price, 
  originalPrice,
  image,
  rating = 0,
  ratingCount = 0,
  discount,
  onClick 
}: ProductCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden border border-neutral hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square bg-neutral-light p-4">
        <img 
          src={image || '/api/placeholder/200/200'} 
          alt={name}
          className="w-full h-full object-contain"
        />
        {discount && discount > 0 && (
          <div className="absolute top-2 left-2 bg-promotion text-white px-2 py-1 rounded text-xs font-semibold">
            -{discount}%
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-primary line-clamp-2 mb-2 min-h-[40px]">
          {name}
        </h3>
        
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-promotion">
            {price?.toLocaleString('vi-VN') || '0'}đ
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-neutral-dark line-through">
              {originalPrice.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-neutral-darker">
          <svg className="w-3 h-3 fill-accent text-accent" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>{rating?.toFixed(1) || '0.0'}</span>
          <span className="text-neutral-dark">({ratingCount || 0})</span>
        </div>
      </div>
    </div>
  );
}