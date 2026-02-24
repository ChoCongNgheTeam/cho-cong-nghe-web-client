"use client";

import Image from "next/image";
import Link from "next/link";
import { Slider } from "../../_libs/getMainBanners";
import { Slidezy } from "@/components/Slider";

interface HomeSliderProps {
   sliders: Slider[];
}

export function HomeSlider({ sliders }: HomeSliderProps) {
   if (sliders.length === 0) return null;
   return (
      <Slidezy
         items={1}
         speed={700}
         loop={true}
         nav={true}
         controls={true}
         autoplay={true}
         autoplayTimeout={5000}
         autoplayHoverPause={true}
         draggable={true}
      >
         {sliders.map((slider) => (
            <Link key={slider.id} href={slider.linkUrl ?? "#"}>
               <div className="relative aspect-21/11 mdd:aspect-21/7 lg:aspect-21/7 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                  {slider.imageUrl && (
                     <Image
                        src={slider.imageUrl}
                        alt={slider.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        quality={75}
                     />
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-black/20" />

                  {/* Title */}
                  <div className="absolute inset-0 flex items-end p-8 md:p-12 lg:p-16">
                     <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-neutral-light mb-4 drop-shadow-2xl tracking-tight leading-tight">
                           {slider.title}
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
