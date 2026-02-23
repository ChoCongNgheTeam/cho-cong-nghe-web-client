"use client";

import Image from "next/image";
import Link from "next/link";
import { BannerDTO } from "@/lib/api-demo";
import { Slidezy } from "@/components/Slider";

interface MainBannerProps {
   banners: BannerDTO[];
}

export default function MainBanner({ banners }: MainBannerProps) {
   if (banners.length === 0) return null;

   return (
      <Slidezy
         items={1}
         speed={700}
         loop={true}
         nav={true}
         controls={true}
         controlsText={["←", "→"]}
         autoplay={true}
         autoplayTimeout={5000}
         autoplayHoverPause={true}
         draggable={true}
      >
         {banners.map((banner) => (
            <Link key={banner.id} href={banner.link_url}>
               <div className="relative aspect-21/9 mdd:aspect-21/7 lg:aspect-21/6 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                  <Image
                     src={banner.image_path}
                     alt={banner.title}
                     fill
                     sizes="(max-width: 768px) 100vw, 50vw"
                     className="object-cover"
                     quality={75}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-black/20" />

                  {/* Title */}
                  <div className="absolute inset-0 flex items-end p-8 md:p-12 lg:p-16">
                     <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-neutral-light mb-4 drop-shadow-2xl tracking-tight leading-tight">
                           {banner.title}
                        </h2>
                        <span className="inline-block px-6 py-2 bg-promotion text-neutral-light font-bold rounded-full text-sm md:text-base hover:bg-promotion-hover transition-colors">
                           Khám phá ngay
                        </span>
                     </div>
                  </div>
               </div>
            </Link>
         ))}
      </Slidezy>
   );
}
