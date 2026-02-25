"use client";

import Image from "next/image";
import Link from "next/link";
import { Campaign, CampaignCategory } from "../../_libs";
interface SeasonalSaleProps {
   campaigns: Campaign[];
}

function SmallBannerCard({ item }: { item: CampaignCategory }) {
   return (
      <Link
         href={`/category/${item.category.slug}`}
         className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
      >
         <div className={`relative aspect-square`}>
            {/* Background Image */}
            <div className="absolute inset-0 transition-opacity duration-300">
               <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
               />
            </div>

            {/* Content */}
            {/* <div className="relative h-full p-4 md:p-5 flex flex-col justify-between">
               <div>
                  <p className="text-white/80 text-[10px] md:text-xs font-semibold mb-1 line-clamp-1">
                     {item.description}
                  </p>
                  <h3 className="text-sm md:text-base lg:text-lg font-black text-white leading-tight drop-shadow-lg line-clamp-2">
                     {item.title}
                  </h3>
               </div>

               <span className="inline-block self-start bg-white text-primary font-bold text-[10px] md:text-xs px-3 py-1.5 rounded-full shadow-lg group-hover:scale-105 transform duration-300 transition-transform">
                  Xem ngay
               </span>
            </div> */}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
         </div>
      </Link>
   );
}

function LargeBannerCard({ item }: { item: CampaignCategory }) {
   return (
      <Link
         href={`/category/${item.category.slug}`}
         className="group relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
      >
         <div className="relative aspect-square">
            {/* Background Image */}
            <Image
               src={item.imageUrl}
               alt={item.title}
               fill
               sizes="(max-width: 768px) 100vw, 50vw"
               className="object-cover duration-700"
            />

            {/* Content */}
            {/* <div className="relative h-full flex items-center justify-center p-6 md:p-8 lg:p-12">
               <div className="text-center max-w-lg">
                  <p className="text-white/90 text-lg md:text-xl lg:text-2xl font-semibold mb-3">
                     {item.description}
                  </p>
                  <h3 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 leading-tight drop-shadow-2xl">
                     {item.title}
                  </h3>

                  <span className="inline-block bg-white text-primary font-bold text-base md:text-lg px-8 py-4 rounded-full shadow-2xl group-hover:scale-105 transform duration-300 transition-transform">
                     Khám phá ngay
                  </span>
               </div>
            </div> */}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
         </div>
      </Link>
   );
}

export function SeasonalSale({ campaigns }: SeasonalSaleProps) {
   if (!campaigns || campaigns.length === 0) return null;

   return (
      <section className="py-6 md:py-8">
         <div className="container space-y-10">
            {campaigns.map((campaign) => {
               // Sắp xếp theo position, lấy 4 ô nhỏ + 1 ô lớn
               const sorted = [...campaign.categories].sort(
                  (a, b) => a.position - b.position,
               );
               const smallCards = sorted.slice(0, 4);
               const largeCard = sorted[4] ?? sorted[sorted.length - 1];

               return (
                  <div key={campaign.id}>
                     {/* Section Header */}
                     <div className="mb-6">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                           {campaign.name}
                        </h2>
                        {campaign.description && (
                           <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {campaign.description}
                           </p>
                        )}
                     </div>

                     {/* Grid: 4 ô nhỏ (trái) + 1 ô lớn (phải) */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left: 2x2 grid */}
                        <div className="grid grid-cols-2 gap-4">
                           {smallCards.map((item) => (
                              <SmallBannerCard key={item.id} item={item} />
                           ))}
                        </div>

                        {/* Right: large card */}
                        {largeCard && <LargeBannerCard item={largeCard} />}
                     </div>
                  </div>
               );
            })}
         </div>
      </section>
   );
}
