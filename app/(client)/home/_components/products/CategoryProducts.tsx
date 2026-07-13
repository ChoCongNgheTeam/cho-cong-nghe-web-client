"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { Slidezy } from "@/components/slider";
import { CATEGORY_ICONS } from "@/lib/api/header/constants";
import { HomeCategoryProductGroup } from "@/(client)/home/_lib/types";

interface CategoryProductsProps {
  groups: HomeCategoryProductGroup[];
}

export function CategoryProducts({ groups }: CategoryProductsProps) {
  const tabs = groups.filter((g) => g.products.length > 0);
  const [activeSlug, setActiveSlug] = useState<string | undefined>(tabs[0]?.category.slug);

  if (tabs.length === 0) return null;

  const activeGroup = tabs.find((g) => g.category.slug === activeSlug) ?? tabs[0];
  const DefaultIcon = CATEGORY_ICONS["dien-thoai"];

  return (
    <section className="py-2 md:py-4">
      <div className="container">
        <div className="bg-surface rounded-2xl overflow-hidden">
          {/* Header + Tabs */}
          <div className="border-b border-surface-border">
            <div className="px-5 md:px-7 pt-5 md:pt-6 flex flex-col sm:flex-row sm:items-center sm:gap-6">
              {/* Title động theo tab đang active */}
              <div className="flex items-center gap-3 shrink-0 pb-3 sm:pb-0">
                <div className="w-1 h-5 rounded-full bg-accent shrink-0" />
                <h2 className="text-lg md:text-xl font-bold text-primary tracking-tight">
                  {activeGroup.category.name} <span className="font-normal text-secondary"></span>
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex items-center overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0">
                {tabs.map((group, idx) => {
                  const isActive = activeGroup.category.slug === group.category.slug;
                  const Icon = CATEGORY_ICONS[group.category.slug] ?? DefaultIcon;
                  return (
                    <button
                      key={group.category.slug}
                      onClick={() => setActiveSlug(group.category.slug)}
                      className={[
                        "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 shrink-0",
                        idx !== tabs.length - 1 ? "border-r border-surface-border" : "",
                        isActive ? "text-accent" : "text-primary/60 hover:text-primary",
                      ].join(" ")}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{group.category.name}</span>
                      {isActive && <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-accent" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="px-3 md:px-5 py-4">
            <Slidezy
              items={{ mobile: 2, tablet: 2, lg: 3, desktop: 4 }}
              gap={16}
              speed={300}
              loop={false}
              nav={false}
              mobileNav="none"
              controls={{ mobile: false, tablet: false, lg: true, desktop: true }}
              slideBy={1}
              draggable={true}
            >
              {activeGroup.products.map((product, index) => (
                <div key={product.id} className={["border-neutral/40", index % 4 !== 3 ? "lg:border-r" : ""].join(" ")}>
                  <div className="p-0 lg:pr-4">
                    <ProductCard product={{ ...product, thumbnail: product.thumbnail ?? "" }} index={index} />
                  </div>
                </div>
              ))}
            </Slidezy>
          </div>

          {/* View all link */}
          <div className="px-5 md:px-7 pb-5 flex justify-center">
            <Link href={`/category/${activeGroup.category.slug}`} className="text-sm font-medium text-accent hover:underline flex items-center gap-1 transition-opacity hover:opacity-80">
              Xem tất cả {activeGroup.category.name}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
