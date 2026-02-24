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
               <div className="relative aspect-video mdd:aspect-[21/8] lg:aspect-21/8 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
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
               </div>
            </Link>
         ))}
      </Slidezy>
   );
}
