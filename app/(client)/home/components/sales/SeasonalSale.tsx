"use client";

import Image from "next/image";
import Link from "next/link";
import { Campaign, CampaignCategory } from "../../_lib/types";

interface SeasonalSaleProps {
  campaigns: Campaign[];
}

function BannerCard({ item, sizes }: { item: CampaignCategory; sizes: string }) {
  return (
    <Link href={`/category/${item.category.slug}`} className="group relative block overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500">
      <div className="relative aspect-square bg-surface">
        {item.imageUrl && <Image src={item.imageUrl} alt={item.title ?? ""} fill sizes={sizes} className="object-cover duration-700 group-hover:scale-[1.03] transition-transform" />}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
      </div>
    </Link>
  );
}

export function SeasonalSale({ campaigns }: SeasonalSaleProps) {
  if (!campaigns || campaigns.length === 0) return null;

  return (
    <section className="py-1 md:py-3">
      <div className="container space-y-10">
        {campaigns.map((campaign) => {
          const sorted = [...campaign.categories].sort((a, b) => a.position - b.position);
          const smallCards = sorted.slice(0, 4);
          const largeCard = sorted[4] ?? sorted[sorted.length - 1];

          return (
            <div key={campaign.id}>
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">{campaign.name}</h2>
                {campaign.description && <p className="text-sm text-primary-light mt-1 line-clamp-2">{campaign.description}</p>}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {smallCards.map((item) => (
                    <BannerCard key={item.id} item={item} sizes="(max-width: 768px) 50vw, 25vw" />
                  ))}
                </div>
                {largeCard && <BannerCard item={largeCard} sizes="(max-width: 768px) 100vw, 50vw" />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
