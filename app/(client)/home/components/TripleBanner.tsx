'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BannerDTO } from '@/lib/api-demo';

// Mock triple banners vì API hiện tại chưa có getTripleBanners
// Bạn có thể thêm function này vào API hoặc dùng mock data
const MOCK_TRIPLE_BANNERS: BannerDTO[] = [
  {
    id: 'triple-1',
    title: 'Banner 1',
    image_path: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=200&fit=crop',
    link_url: '/promo-1',
    type: 'triple',
    position: 1,
  },
  {
    id: 'triple-2',
    title: 'Banner 2',
    image_path: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=200&fit=crop',
    link_url: '/promo-2',
    type: 'triple',
    position: 2,
  },
  {
    id: 'triple-3',
    title: 'Banner 3',
    image_path: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=200&fit=crop',
    link_url: '/promo-3',
    type: 'triple',
    position: 3,
  },
];

export default function TripleBanner() {
  const [banners, setBanners] = useState<BannerDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // TODO: Khi có getTripleBanners() trong API thì thay bằng:
        // const data = await getTripleBanners();
        
        // Tạm thời dùng mock data
        await new Promise(resolve => setTimeout(resolve, 200));
        setBanners(MOCK_TRIPLE_BANNERS);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[200px] bg-neutral animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.link_url}
            className="relative h-[200px] rounded-lg overflow-hidden group"
          >
            <Image
              src={banner.image_path}
              alt={banner.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}