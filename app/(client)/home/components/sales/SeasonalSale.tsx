"use client";

import Image from "next/image";
import Link from "next/link";
import { Campaign, CampaignCategory } from "../../_lib/types";
interface SeasonalSaleProps {
  campaigns: Campaign[];
}

function SmallBannerCard({ item }: { item: CampaignCategory }) {
  return (
    <Link href={`/category/${item.category.slug}`} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
      <div className={`relative aspect-square`}>
        {/* Background Image */}
        {item.imageUrl && (
          <div className="absolute inset-0 transition-opacity duration-300">
            <Image src={item.imageUrl} alt={item.title ?? ""} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
}

function LargeBannerCard({ item }: { item: CampaignCategory }) {
  return (
    <Link href={`/category/${item.category.slug}`} className="group relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
      <div className="relative aspect-square">
        {/* Background Image */}
        <Image src={item.imageUrl ?? ""} alt={item.title ?? ""} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover duration-700" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
}

export function SeasonalSale({ campaigns }: SeasonalSaleProps) {
  if (!campaigns || campaigns.length === 0) return null;

  return (
    <section className="py-1 md:py-3 bg-neutral-light">
      <div className="container space-y-10">
        {campaigns.map((campaign) => {
          // Sắp xếp theo position, lấy 4 ô nhỏ + 1 ô lớn
          const sorted = [...campaign.categories].sort((a, b) => a.position - b.position);
          const smallCards = sorted.slice(0, 4);
          const largeCard = sorted[4] ?? sorted[sorted.length - 1];

          return (
            <div key={campaign.id}>
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">{campaign.name}</h2>
                {campaign.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{campaign.description}</p>}
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
