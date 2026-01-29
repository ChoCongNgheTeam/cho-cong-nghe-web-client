'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories, CategoryDTO } from '@/lib/api-demo';

export default function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="h-64 bg-neutral animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="container py-8">
      <h2 className="text-2xl font-bold text-primary mb-6">Danh mục nổi bật</h2>
      
      <div className="bg-white rounded-2xl border border-neutral p-8 shadow-sm">
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-x-8 gap-y-12">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative w-24 h-24 flex items-center justify-center">
                <Image
                  src={category.image_path}
                  alt={category.name}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  sizes="96px"
                />
              </div>
              <span className="text-sm text-center font-medium text-primary group-hover:text-promotion transition-colors line-clamp-2 w-full">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}