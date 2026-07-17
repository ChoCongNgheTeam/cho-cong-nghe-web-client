"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeSlider } from "./HomeSlider";
import { SidebarCategoryList } from "../categories/SidebarCategoryList";
import type { Slider, Banner } from "../../_lib/types";
import { Category } from "@/types/category";
import { useCategoryMenuStore } from "@/store/categoryMenu.store";

const PromoColumn = memo(function PromoColumn({ banners }: { banners: Banner[] }) {
  const validBanners = banners?.filter((b): b is Banner & { imageUrl: string } => Boolean(b.imageUrl)) ?? [];

  if (!validBanners.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="px-1 py-0.5">
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Khuyến mãi nổi bật</span>
      </div>
      {validBanners.slice(0, 3).map((banner) => (
        <Link
          key={banner.id}
          href={banner.linkUrl ?? "#"}
          className="relative h-[92px] rounded-xl overflow-hidden group border border-surface-border hover:border-accent transition-all hover:shadow-md"
        >
          <Image src={banner.imageUrl} alt={banner.title ?? ""} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-2 left-3 text-white text-[12px] font-semibold drop-shadow">{banner.title}</span>
        </Link>
      ))}
    </div>
  );
});

interface HomeSliderSectionProps {
  sliders: Slider[];
  categories: Category[];
  bannersDeal: Banner[];
}

export const HomeSliderSection = memo(function HomeSliderSection({ sliders, categories, bannersDeal }: HomeSliderSectionProps) {
  const isCategoryOpen = useCategoryMenuStore((s) => s.isOpen);
  const close = useCategoryMenuStore((s) => s.close);

  return (
    <div className="container md:py-3 pb-3">
      <div className="md:hidden">
        <HomeSlider sliders={sliders} />
      </div>
      <div className="hidden md:grid gap-3 items-start" style={{ gridTemplateColumns: "180px 1fr 160px" }}>
        <SidebarCategoryList categories={categories} isHighlighted={isCategoryOpen} onClose={close} />
        <div className="rounded-xl overflow-hidden min-w-0">
          <HomeSlider sliders={sliders} />
        </div>
        <PromoColumn banners={bannersDeal} />
      </div>
    </div>
  );
});
