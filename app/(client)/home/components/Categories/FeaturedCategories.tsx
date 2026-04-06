"use client";

import Image from "next/image";
import Link from "next/link";
import { Slidezy } from "@/components/Slider";
import { FeaturedCategory } from "../../_libs";

interface CategoryGridProps {
  featuredCategories: FeaturedCategory[];
}

function CategoryItem({ category }: { category: FeaturedCategory }) {
  return (
    <Link href={`/category/${category.slug}`} className="group/item block">
      <div className="flex flex-col items-center">
        <div className="relative w-full bg-neutral-light rounded-2xl p-0.5 md:p-4 transition-all duration-300 group-hover/item:scale-105">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden">
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              sizes="(max-width: 1024px) 25vw, 12.5vw"
              className="object-contain p-2 transition-transform duration-500 group-hover/item:scale-110"
            />
          </div>
        </div>
        <p className="mt-3 text-center text-sm font-semibold text-primary transition-colors duration-300 line-clamp-2 px-1">{category.name}</p>
      </div>
    </Link>
  );
}

export function FeaturedCategories({ featuredCategories }: CategoryGridProps) {
  // Chunk thành cặp — chỉ dùng cho mobile/tablet slider
  const pairedCategories = featuredCategories.reduce<FeaturedCategory[][]>((acc, item, i) => {
    if (i % 2 === 0) acc.push([item]);
    else acc[acc.length - 1].push(item);
    return acc;
  }, []);

  return (
    <section className="py-4 md:py-6 bg-linear-to-b">
      <div className="container">
        <div className="bg-neutral-light rounded-3xl border-2 border-neutral p-6 md:p-8">
          <div className="mb-3">
            <h2 className="text-xl md:text-3xl font-bold text-primary tracking-tight">Danh mục nổi bật</h2>
          </div>

          {/* Mobile & Tablet (< 1024px): 2 rows × 4 cols, kéo được */}
          <div className="lg:hidden">
            <Slidezy items={{ mobile: 4, tablet: 4, lg: 4 }} gap={12} speed={300} loop={false} nav={false} mobileNav="none" controls={false} slideBy={2} draggable={true}>
              {pairedCategories.map((pair, pairIndex) => (
                <div key={pairIndex} className="flex flex-col gap-3">
                  {pair.map((category) => (
                    <CategoryItem key={category.id} category={category} />
                  ))}
                </div>
              ))}
            </Slidezy>
          </div>

          {/* Desktop (≥ 1024px): 1 row, slider bình thường */}
          <div className="hidden lg:block">
            <Slidezy items={{ desktop: 8 }} gap={12} speed={300} loop={false} nav={false} mobileNav="none" controls={true} slideBy={2} draggable={true}>
              {featuredCategories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </Slidezy>
          </div>
        </div>
      </div>
    </section>
  );
}
