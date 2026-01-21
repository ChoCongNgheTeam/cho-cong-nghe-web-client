// components/home/SuggestionSection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/shared/ProductCard';
import SectionTitle from '@/components/shared/SectionTitle';
import type { ProductDetail } from '@/lib/types/product';

const API_BASE = 'http://localhost:5001/api';

export default function SuggestionSection() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestionProducts();
  }, []);

  const fetchSuggestionProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products?isFeatured=true&limit=10`);
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching suggestion products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductCardProps = (product: ProductDetail) => {
    const variant = product.variants?.[0];
    const variantPrice = variant ? parseFloat(variant.price) : 0;
    const originalPrice = variantPrice * 1.15; // Giả sử giá gốc cao hơn 15%
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
      <SectionTitle 
        title="Gợi ý cho bạn" 
        actionText="Xem thêm"
        onActionClick={() => console.log('View more suggestions')}
      />
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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