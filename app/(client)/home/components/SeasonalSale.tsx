'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductDTO } from '@/lib/api-demo';

// Mock data cho seasonal sale vì API chưa có endpoint này
// Bạn có thể thêm getSeasonalSale() vào API file
const MOCK_SEASONAL_DATA = {
  title: 'Sale Tết - Giao Tận Nhà',
  banner: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=800&fit=crop',
};

export default function SeasonalSale() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // TODO: Khi có API getSeasonalSale() thì gọi ở đây
        // const result = await getSeasonalSale();
        await new Promise(resolve => setTimeout(resolve, 300));
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
        <div className="h-96 bg-neutral animate-pulse rounded-lg" />
      </div>
    );
  }

  // Mock categories - 3 sections with items
  const categories = [
    {
      title: 'Công nghệ',
      items: [
        { name: 'Laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop' },
        { name: 'Màn hình', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop' },
        { name: 'Điện thoại', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop' },
        { name: 'Máy tính bảng', image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200&h=200&fit=crop' },
      ]
    },
    {
      title: 'Phụ Kiến',
      items: [
        { name: 'Đồng hồ', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop' },
        { name: 'Máy chiếu', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&h=200&fit=crop' },
        { name: 'Loa', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop' },
        { name: 'Tai nghe', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' },
      ]
    },
    {
      title: 'Nghiên nhà',
      items: [
        { name: 'Máy sấy', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=200&h=200&fit=crop' },
        { name: 'Máy giặt', image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=200&h=200&fit=crop' },
        { name: 'Máy lọc nước', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&h=200&fit=crop' },
      ]
    },
  ];

  return (
    <section className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">{MOCK_SEASONAL_DATA.title}</h2>
        <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          Xem gợi ý khác
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Banner lớn bên trái */}
        <div className="lg:col-span-1">
          <Link href="#" className="block relative h-full min-h-[500px] rounded-2xl overflow-hidden group shadow-lg">
            <Image
              src={MOCK_SEASONAL_DATA.banner}
              alt={MOCK_SEASONAL_DATA.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 25vw"
              priority
            />
            
            {/* Overlay text */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60">
              <div className="absolute top-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2 leading-tight">
                  Giao Tết tận nhà<br />
                  Hàng hiệu giảm tất
                </h3>
                <button className="mt-4 bg-white text-promotion px-4 py-2 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors flex items-center gap-2">
                  Hốt ngay
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        </div>

        {/* Grid danh mục bên phải - 3 columns */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, catIndex) => (
            <div key={catIndex} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral">
              <h3 className="text-xl font-bold text-primary mb-4">{category.title}</h3>
              
              {/* Grid 2x2 for items */}
              <div className="grid grid-cols-2 gap-4">
                {category.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href="#"
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                        sizes="150px"
                      />
                    </div>
                    <span className="text-sm text-center font-medium text-primary group-hover:text-promotion transition-colors">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}