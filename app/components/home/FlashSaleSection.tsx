// components/home/FlashSaleSection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/shared/ProductCard';
import CountdownTimer from '@/components/shared/CountdownTimer';
import Slidezy from '@/components/Slider/Slidezy';
import type { ProductDetail } from '@/lib/types/product';

const API_BASE = 'http://localhost:5001/api';

export default function FlashSaleSection() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashSaleProducts();
  }, []);

  const fetchFlashSaleProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products?limit=10`);
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching flash sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductCardProps = (product: ProductDetail) => {
    const variant = product.variants?.[0];
    const variantPrice = variant ? parseFloat(variant.price) : 0;
    const originalPrice = variantPrice * 1.2; // Giả sử giá gốc cao hơn 20%
    const discount = Math.round(((originalPrice - variantPrice) / originalPrice) * 100);

    return {
      id: product.id,
      name: product.name,
      price: variantPrice,
      originalPrice: originalPrice,
      image: variant?.images?.[0]?.imageUrl,
      rating: parseFloat(product.ratingAverage) || 0,
      ratingCount: product.ratingCount || 0,
      discount
    };
  };

  if (loading) {
    return (
      <section className="mb-8">
        <div className="bg-gradient-to-br from-promotion to-promotion-hover rounded-lg p-4 sm:p-6">
          <div className="h-20 bg-white/20 rounded-lg animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="bg-gradient-to-br from-promotion to-promotion-hover rounded-lg p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              GIỜ VÀNG HOT LIXI DEAL
            </h2>
            <span className="text-white/90 text-sm bg-white/20 px-3 py-1 rounded-full">
              10H-14H
            </span>
          </div>
          
          <CountdownTimer hours={5} minutes={8} seconds={28} />
        </div>

        {/* Products Slider */}
        <Slidezy
          items={{ mobile: 2, tablet: 3, desktop: 5 }}
          gap={12}
          speed={400}
          loop={true}
          autoplay={false}
          controls={true}
          nav={false}
        >
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              {...getProductCardProps(product)}
              onClick={() => console.log('Product clicked:', product.id)}
            />
          ))}
        </Slidezy>
      </div>
    </section>
  );
}