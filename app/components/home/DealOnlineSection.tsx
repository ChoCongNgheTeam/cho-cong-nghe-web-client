// components/home/DealOnlineSection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/shared/ProductCard';
import type { ProductDetail } from '@/lib/types/product';

const API_BASE = 'http://localhost:5001/api';

const categories = [
  { icon: '🔥', label: 'MÁY HÓT GIÁ NGON', color: 'from-promotion/10 to-promotion-light' },
  { icon: '🧺', label: 'GIẶT - SẤY TIỆN LỢI', color: 'from-blue-50 to-blue-100' },
  { icon: '📺', label: 'TIVI SẮC NÉT', color: 'from-purple-50 to-purple-100' },
  { icon: '❄️', label: 'TỦ LẠNH HIỆN ĐẠI', color: 'from-green-50 to-green-100' },
  { icon: '🏠', label: 'ĐIỀU HÒA LẠNH SÂU', color: 'from-cyan-50 to-cyan-100' },
];

export default function DealOnlineSection() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealProducts();
  }, []);

  const fetchDealProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products?limit=10&offset=5`);
      const data = await response.json();
      setProducts(data.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching deal products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductCardProps = (product: ProductDetail) => {
    const variant = product.variants?.[0];
    const variantPrice = variant ? parseFloat(variant.price) : 0;
    const originalPrice = variantPrice * 1.3; // Giả sử giá gốc cao hơn 30%
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

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-promotion to-promotion-hover rounded-lg p-1 mb-4">
        <div className="bg-white rounded-lg p-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-promotion mb-4">
            Deal Tết Online Giá Chạm Đáy
          </h2>
          <div className="flex justify-center gap-3 flex-wrap">
            {categories.map((cat, idx) => (
              <div 
                key={idx}
                className={`bg-gradient-to-br ${cat.color} px-4 py-2 rounded-full font-semibold text-sm cursor-pointer hover:scale-105 transition-transform`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              {...getProductCardProps(product)}
              onClick={() => console.log('Product clicked:', product.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}