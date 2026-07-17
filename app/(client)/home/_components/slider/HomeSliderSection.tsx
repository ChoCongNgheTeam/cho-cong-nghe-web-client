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
    <div className="container lg:py-3 pb-3">
      {/* Margin âm triệt tiêu đúng padding-inline của .container (0.75rem / 1rem)
          để slider tràn sát mép màn hình ở mobile, không ảnh hưởng các section khác */}
      <div className="lg:hidden -mx-3 min-[375px]:-mx-4">
        <HomeSlider sliders={sliders} />
      </div>
      <div className="hidden lg:grid gap-3 items-start" style={{ gridTemplateColumns: "180px 1fr 160px" }}>
        <SidebarCategoryList categories={categories} isHighlighted={isCategoryOpen} onClose={close} />
        <div className="rounded-xl overflow-hidden min-w-0">
          <HomeSlider sliders={sliders} />
        </div>
        <PromoColumn banners={bannersDeal} />
      </div>
    </div>
  );
});
