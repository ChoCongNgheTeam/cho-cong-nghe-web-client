"use client";

import { memo, useState, useCallback, useEffect, startTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeSlider } from "./HomeSlider";
import { SidebarCategoryList } from "../categories/SidebarCategoryList";
import type { Slider } from "../../_lib/types";
import { Category } from "@/types/category";

const MOCK_PROMOS = [
  { id: 1, image: "https://placehold.co/280x120/e8873a/ffffff?text=Deal+1", label: "Giảm đến 50%", href: "/sale" },
  { id: 2, image: "https://placehold.co/280x120/c0392b/ffffff?text=Deal+2", label: "Flash Sale hôm nay", href: "/flash-sale" },
  { id: 3, image: "https://placehold.co/280x120/1a1a2e/ffffff?text=Deal+3", label: "Mua 1 tặng 1", href: "/promotion" },
];

const PromoColumn = memo(function PromoColumn() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="px-1 py-0.5">
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Khuyến mãi nổi bật</span>
      </div>
      {MOCK_PROMOS.map((promo) => (
        <Link key={promo.id} href={promo.href} className="relative flex-1 rounded-xl overflow-hidden group border border-surface-border hover:border-accent transition-all hover:shadow-md">
          <Image src={promo.image} alt={promo.label} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-2 left-3 text-white text-[12px] font-semibold drop-shadow">{promo.label}</span>
        </Link>
      ))}
    </div>
  );
});

interface HomeSliderSectionProps {
  sliders: Slider[];
  categories: Category[];
}

export const HomeSliderSection = memo(function HomeSliderSection({ sliders, categories }: HomeSliderSectionProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ open: boolean }>;
      startTransition(() => setIsCategoryOpen(custom.detail.open));
    };
    window.addEventListener("category-menu-toggle", handler);
    return () => window.removeEventListener("category-menu-toggle", handler);
  }, []);

  const handleClose = useCallback(() => setIsCategoryOpen(false), []);

  return (
    <div className="container md:py-3 pb-3">
      {/* Mobile */}
      <div className="md:hidden">
        <HomeSlider sliders={sliders} />
      </div>

      {/* Desktop 3 cột */}
      <div className="hidden md:grid gap-3" style={{ gridTemplateColumns: "180px 1fr 160px" }}>
        <SidebarCategoryList categories={categories} isHighlighted={isCategoryOpen} onClose={handleClose} />
        <div className="rounded-xl overflow-hidden min-w-0">
          <HomeSlider sliders={sliders} />
        </div>
        <PromoColumn />
      </div>
    </div>
  );
});
