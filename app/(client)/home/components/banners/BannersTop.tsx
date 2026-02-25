"use client";

import Image from "next/image";
import Link from "next/link";
import { Slidezy } from "@/components/Slider";
import { Banner } from "../../_libs";

interface BannersTopProps {
   bannersTop: Banner[];
}

export function BannersTop({ bannersTop }: BannersTopProps) {
   if (bannersTop.length === 0) return null;

   return (
      <section className="py-6 md:py-8">
         <div className="container px-4">
            <Slidezy
               items={{ mobile: 1, tablet: 2, desktop: 2 }}
               gap={24}
               speed={400}
               loop={false}
               nav={false}
               controls={bannersTop.length > 2}
               slideBy={1}
               draggable={true}
            >
               {bannersTop.map((banner) => (
                  <Link
                     key={banner.id}
                     href={banner.linkUrl ?? "#"}
                     className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 block"
                  >
                     <div className="relative aspect-16/6 overflow-hidden">
                        {banner.imageUrl && (
                           <Image
                              src={banner.imageUrl}
                              alt={banner.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              quality={75}
                              sizes="(max-width: 768px) 100vw, 50vw"
                           />
                        )}
                        {/* <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-promotion/0 group-hover:bg-promotion/10 transition-colors duration-500" /> */}
                     </div>

                     <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-5">
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                           <span className="text-sm md:text-base font-bold text-neutral-light bg-promotion px-6 py-2.5 rounded-full hover:bg-promotion-hover transition-colors shadow-lg">
                              Xem ngay
                           </span>
                        </div>
                     </div>
                     <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-neutral-light/30 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>
               ))}
            </Slidezy>
         </div>
      </section>
   );
}
