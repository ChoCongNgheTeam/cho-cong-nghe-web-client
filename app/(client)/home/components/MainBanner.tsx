'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMainBanners, BannerDTO } from '@/lib/api-demo';
import Slidezy from '@/components/Slider/Slidezy';

export default function MainBanner() {
  const [banners, setBanners] = useState<BannerDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBanners() {
      try {
        const data = await getMainBanners();
        setBanners(data);
      } catch (error) {
        console.error('Error loading banners:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-neutral-light">
        <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-neutral animate-pulse" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-gradient-to-b from-neutral-light to-white group/banner">
      <style jsx global>{`
        /* Ẩn controls mặc định */
        .group\/banner .slidezy-container button[aria-label="Previous slide"],
        .group\/banner .slidezy-container button[aria-label="Next slide"] {
          opacity: 0;
          transition: opacity 0.3s ease, background-color 0.2s ease;
        }

        /* Hiện controls khi hover vào banner */
        .group\/banner:hover .slidezy-container button[aria-label="Previous slide"],
        .group\/banner:hover .slidezy-container button[aria-label="Next slide"] {
          opacity: 1;
        }

        /* Style lại controls cho đẹp hơn */
        .group\/banner .slidezy-container button[aria-label="Previous slide"],
        .group\/banner .slidezy-container button[aria-label="Next slide"] {
          background: rgba(0, 0, 0, 0.5) !important;
          color: white !important;
          width: 50px !important;
          height: 50px !important;
          backdrop-filter: blur(4px);
        }

        .group\/banner .slidezy-container button[aria-label="Previous slide"]:hover,
        .group\/banner .slidezy-container button[aria-label="Next slide"]:hover {
          background: rgba(0, 0, 0, 0.8) !important;
          transform: translateY(-50%) scale(1.1);
        }

        .group\/banner .slidezy-container button[aria-label="Previous slide"] {
          left: 20px !important;
        }

        .group\/banner .slidezy-container button[aria-label="Next slide"] {
          right: 20px !important;
        }

        /* Mobile: thu nhỏ controls */
        @media (max-width: 768px) {
          .group\/banner .slidezy-container button[aria-label="Previous slide"],
          .group\/banner .slidezy-container button[aria-label="Next slide"] {
            width: 40px !important;
            height: 40px !important;
            font-size: 20px !important;
          }
          
          .group\/banner .slidezy-container button[aria-label="Previous slide"] {
            left: 10px !important;
          }
          
          .group\/banner .slidezy-container button[aria-label="Next slide"] {
            right: 10px !important;
          }
        }
      `}</style>

      <Slidezy
        items={1}
        speed={500}
        gap={0}
        loop={true}
        nav={true}
        controls={true}
        controlsText={['‹', '›']}
        slideBy={1}
        autoplay={true}
        autoplayTimeout={5000}
        autoplayHoverPause={true}
        draggable={true}
      >
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.link_url}
            className="block relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden group"
          >
            <Image
              src={banner.image_path}
              alt={banner.title}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </Link>
        ))}
      </Slidezy>
    </section>
  );
}