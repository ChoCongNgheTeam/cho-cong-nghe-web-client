"use client";

import Image from "next/image";
import Link from "next/link";
import { Slidezy } from "@/components/slider";
import { FeaturedCategory } from "../../_lib/types";

function CategoryItem({ category }: { category: FeaturedCategory }) {
  return (
    <Link href={`/category/${category.slug}`} className="group/item block h-full">
      <div className="flex flex-col justify-center items-center gap-3 px-4 py-3 h-full transition-colors duration-200 hover:bg-neutral-light/60 rounded-xl">
        {/* Image */}
        <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 relative">
          {category.imageUrl && <Image src={category.imageUrl} alt={category.name} fill sizes="64px" className="object-contain transition-transform duration-300 group-hover/item:scale-110" />}
        </div>

        {/* Label */}
        <p className="font-semibold text-primary group-hover/item:text-accent transition-colors duration-200 line-clamp-2 leading-snug" style={{ fontSize: "clamp(11px, 2vw, 13px)" }}>
          {category.name}
        </p>
      </div>
    </Link>
  );
}

export function FeaturedCategories({ featuredCategories }: { featuredCategories: FeaturedCategory[] }) {
  // Chunk thành cặp — chỉ dùng cho mobile/tablet slider
  const pairedCategories = featuredCategories.reduce<FeaturedCategory[][]>((acc, item, i) => {
    if (i % 2 === 0) acc.push([item]);
    else acc[acc.length - 1].push(item);
    return acc;
  }, []);

  return (
    <section className="py-2 md:py-4">
      <div className="container">
        {/* Section card — shadow thay border */}
        <div className="bg-surface rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 md:px-7 pt-5 md:pt-6 pb-4 border-b border-neutral/40 flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-accent shrink-0" />
            <h2 className="text-lg md:text-xl font-bold text-primary tracking-tight">Danh mục nổi bật</h2>
          </div>

          {/* Mobile & Tablet (< 1024px): 2 rows × 4 cols, kéo được */}
          <div className="lg:hidden px-3 py-3">
            <Slidezy items={{ mobile: 4, tablet: 4, lg: 4 }} gap={0} speed={300} loop={false} nav={false} mobileNav="none" controls={false} slideBy={2} draggable={true}>
              {pairedCategories.map((pair, pairIndex) => (
                <div key={pairIndex} className="flex flex-col divide-y divide-neutral/40 border-r border-neutral/40 last:border-r-0">
                  {pair.map((category) => (
                    <CategoryItem key={category.id} category={category} />
                  ))}
                </div>
              ))}
            </Slidezy>
          </div>

          {/* Desktop (≥ 1024px): 1 row, có nút trượt */}
          <div className="hidden lg:block px-2 py-2">
            <Slidezy items={{ desktop: 8 }} gap={0} speed={300} loop={false} nav={false} mobileNav="none" controls={true} slideBy={2} draggable={true}>
              {featuredCategories.map((category, idx) => (
                <div
                  key={category.id}
                  className={[
                    "border-neutral/40",
                    idx % 8 !== 7 ? "border-r" : "", // divider giữa các cột trong "hàng ảo"
                  ].join(" ")}
                >
                  <CategoryItem category={category} />
                </div>
              ))}
            </Slidezy>
          </div>
        </div>
      </div>
    </section>
  );
}
