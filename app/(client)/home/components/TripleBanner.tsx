"use client";

import Image from "next/image";
import Link from "next/link";
import { BannerDTO } from "@/lib/api-demo";

interface TripleBannerProps {
   banners: BannerDTO[];
}

export default function TripleBanner({ banners }: TripleBannerProps) {
   if (banners.length === 0) return null;

   return (
      <section className="py-6 md:py-8">
         <div className="container">
            <div className="grid md:grid-cols-3 gap-6">
               {banners.map((banner) => (
                  <Link
                     key={banner.id}
                     href={banner.link_url}
                     className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                     {/* Image Container */}
                     <div className="relative aspect-video md:aspect-16/8 overflow-hidden bg-linear-to-br from-slate-900 to-slate-800">
                        <Image
                           src={banner.image_path}
                           alt={banner.title}
                           fill
                           sizes="(max-width: 768px) 100vw, 50vw"
                           className="object-cover transition-transform duration-700 group-hover:scale-110"
                           quality={75}
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-promotion/0 group-hover:bg-promotion/10 transition-colors duration-500" />
                     </div>

                     {/* Content Overlay */}
                     <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-neutral-light mb-3 drop-shadow-lg transform transition-transform duration-500 group-hover:translate-x-2">
                           {banner.title}
                        </h3>

                        {/* CTA Button */}
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                           <span className="text-sm md:text-base font-bold text-neutral-light bg-promotion px-6 py-2.5 rounded-full hover:bg-promotion-hover transition-colors shadow-lg">
                              Xem ngay
                           </span>
                           <svg
                              className="w-6 h-6 text-neutral-light transform transition-transform duration-300 group-hover:translate-x-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2.5}
                                 d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                           </svg>
                        </div>
                     </div>

                     {/* Corner Accent */}
                     <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-neutral-light/30 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>
               ))}
            </div>
         </div>
      </section>
   );
}
