// components/home/CategorySection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import CategoryIcon from '@/components/shared/CategoryIcon';
import SectionTitle from '@/components/shared/SectionTitle';
import type { Category } from '@/lib/types/product';

const API_BASE = 'http://localhost:5001/api';

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/categories`);
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    console.log('Category clicked:', categoryId);
    // Navigate to category page
  };

  if (loading) {
    return (
      <section className="mb-8">
        <SectionTitle title="Danh mục nổi bật" />
        <div className="bg-white rounded-lg p-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-light rounded-lg animate-pulse" />
                <div className="h-4 w-16 bg-neutral-light rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <SectionTitle title="Danh mục nổi bật" />
      <div className="bg-white rounded-lg p-4">
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
          {categories.slice(0, 16).map((category) => (
            <CategoryIcon
              key={category.id}
              icon={`/api/placeholder/80/80`}
              label={category.name}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}