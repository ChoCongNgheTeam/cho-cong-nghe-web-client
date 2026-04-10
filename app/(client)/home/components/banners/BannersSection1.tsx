"use client";

import Image from "next/image";
import Link from "next/link";
import type { Banner } from "../../types";
import { Slidezy } from "@/components/Slider";

interface BannersSection1Props {
  banners: Banner[];
}

export function BannersSection1({ banners }: BannersSection1Props) {
  if (banners.length === 0) return null;

  return (
    <section className="py-6 md:py-8 bg-neutral-light-active">
      <div className="container px-4">
        <Slidezy
          items={{ mobile: 1, tablet: 2, desktop: 2 }}
          gap={24}
          speed={400}
          loop={false}
          nav={true}
          mobileNav="dots"
          controls={banners.length > 2}
          controlsOffset="16"
          slideBy={1}
          draggable={true}
        >
          {banners.map((banner) => (
            <Link key={banner.id} href={banner.linkUrl ?? "#"} className="group relative overflow-hidden rounded-3xl shadow-md hover:shadow-lg transition-all duration-500 block">
              {/* Aspect ratio thay cho height */}
              <div className="relative aspect-[2/1] md:aspect-[2.4/1] overflow-hidden">
                {banner.imageUrl && (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center md:object-[center_40%] transition-transform duration-700 group-hover:scale-105"
                    quality={75}
                  />
                )}
              </div>

              {/* Corner effect */}
              <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-neutral-light/30 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </Slidezy>
      </div>
    </section>
  );
}
