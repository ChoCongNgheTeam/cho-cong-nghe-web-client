'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getHotProducts, ProductDTO, BannerDTO } from '@/lib/api-demo';
import Slidezy from '@/components/Slider/Slidezy';
import ProductCard from './ProductCard';

// Mock banners cho hot products section (vì API chỉ trả về products)
const HOT_BANNERS: BannerDTO[] = [
  {
    id: 'hot-banner-1',
    title: 'Hot Sale',
    image_path: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=600&fit=crop',
    link_url: '/hot-sale',
    type: 'hot',
    position: 1,
  },
  {
    id: 'hot-banner-2',
    title: 'Deal HOT',
    image_path: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=600&fit=crop',
    link_url: '/deals',
    type: 'hot',
    position: 2,
  },
];

export default function HotProductsSection() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getHotProducts();
        setProducts(result);
      } catch (error) {
        console.error('Error loading hot products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="h-80 bg-neutral animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Banners bên trái */}
        <div className="lg:col-span-3">
          <Slidezy
            items={1}
            speed={400}
            gap={0}
            loop={true}
            nav={true}
            controls={false}
            autoplay={true}
            autoplayTimeout={4000}
            draggable={true}
          >
            {HOT_BANNERS.map((banner) => (
              <Link
                key={banner.id}
                href={banner.link_url}
                className="block relative h-[300px] rounded-lg overflow-hidden group"
              >
                <Image
                  src={banner.image_path}
                  alt={banner.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 25vw"
                />
              </Link>
            ))}
          </Slidezy>
        </div>

        {/* Products grid bên phải */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((productDTO) => (
              <ProductCard 
                key={productDTO.product.id} 
                product={productDTO} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}