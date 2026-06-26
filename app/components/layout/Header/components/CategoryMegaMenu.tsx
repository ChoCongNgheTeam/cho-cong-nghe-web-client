import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { Menu, ChevronRight, Smartphone, Package, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Category } from "../types";
import { fetchCategories } from "../_libs/header";
import { BRAND_ICONS, CATEGORY_ICONS } from "../_libs/constants";

const BrandGrid = ({ brands }: { brands: Category[] }) => {
  const brandIcons = { ...BRAND_ICONS };
  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-promotion" />
        Thương hiệu nổi bật
      </h4>
      <div className="grid grid-cols-5 gap-3">
        {brands.map((brand) => {
          const Icon = brandIcons[brand.slug] || Smartphone;
          return (
            <Link
              key={brand.id}
              href={`/category/${brand.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-neutral-light border border-neutral rounded-xl hover:border-accent hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-neutral-light-active rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary text-center">{brand.name.replace(" (iPhone)", "")}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

BrandGrid.displayName = "BrandGrid";

const HotItemList = ({ items }: { items: { name: string; badge?: string }[] }) => (
  <div className="mb-6">
    <h4 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
      <Zap className="w-4 h-4 text-promotion" />
      Sản phẩm HOT
    </h4>
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <div key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-promotion border border-promotion rounded-full hover:shadow-md transition-all cursor-pointer group">
          <span className="text-sm font-medium text-neutral">{item.name}</span>
          {item.badge && <span className="px-2 py-0.5 text-xs font-bold text-neutral-light bg-promotion rounded-full">{item.badge}</span>}
        </div>
      ))}
    </div>
  </div>
);

HotItemList.displayName = "HotItemList";

const PriceRangeList = ({ priceCategories }: { priceCategories: Category[] }) => (
  <div className="pt-6 border-t border-neutral">
    <h4 className="text-sm font-semibold text-primary-light mb-4 flex items-center gap-2">💰 Theo mức giá</h4>
    <div className="flex flex-wrap gap-2">
      {priceCategories.map((price) => (
        <div key={price.id} className="px-4 py-2 bg-neutral-light border border-neutral rounded-full hover:border-accent hover:bg-accent-light transition-all cursor-pointer">
          <span className="text-sm font-medium text-primary-light">{price.name}</span>
        </div>
      ))}
    </div>
  </div>
);
PriceRangeList.displayName = "PriceRangeList";

const CategoryList = memo(({ categories, activeCategory, onHover }: { categories: Category[]; activeCategory: Category | null; onHover: (category: Category) => void }) => {
  const getIcon = (slug: string): React.ElementType => CATEGORY_ICONS[slug] ?? Package;

  return (
    <div className="w-64 bg-neutral-light-active border-r border-neutral flex flex-col h-full overflow-y-auto">
      {categories.map((category) => {
        const Icon = getIcon(category.slug);
        const isActive = activeCategory?.id === category.id;
        return (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            onMouseEnter={() => onHover(category)}
            className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all border-l-4 ${
              isActive ? "bg-neutral-light border-primary text-primary" : "border-transparent hover:bg-neutral-light text-primary"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{category.name}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-dark" />
          </Link>
        );
      })}
    </div>
  );
});
CategoryList.displayName = "CategoryList";

const MegaPanel = memo(({ category }: { category: Category | null }) => {
  if (!category) return null;

  const brands = category.children?.filter((child) => ["apple-iphone", "samsung", "xiaomi", "oppo", "honor"].includes(child.slug));
  const hotItems =
    category.slug === "dien-thoai"
      ? [{ name: "iPhone 16 Series", badge: "HOT" }, { name: "Galaxy S25", badge: "MỚI" }, { name: "Xiaomi 15 Pro" }, { name: "OPPO Find X8" }, { name: "Điện thoại gập" }]
      : [];
  const priceCategory = category.children?.find((c) => c.slug === "theo-phan-khuc-gia");
  const mainCategories = category.children?.filter((child) => child.slug !== "theo-phan-khuc-gia" && child.slug !== "theo-nhu-cau");

  return (
    <div className="flex-1 bg-neutral-light p-8 overflow-y-auto custom-scrollbar h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-linear-to-br from-accent to-accent-active rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-neutral" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-primary">{category.name}</h3>
          <p className="text-sm text-neutral-dark">Khám phá sản phẩm tốt nhất</p>
        </div>
      </div>

      {brands && brands.length > 0 && <BrandGrid brands={brands} />}
      {hotItems.length > 0 && <HotItemList items={hotItems} />}

      {mainCategories && mainCategories.length > 0 && (
        <div className="grid grid-cols-4 gap-6 mb-6">
          {mainCategories.map((cat) => (
            <div key={cat.id} className="space-y-2">
              <Link href={`/category/${cat.slug}`} className="font-semibold text-primary text-sm flex items-center gap-1 group cursor-pointer hover:text-accent transition-colors">
                {cat.name}
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {cat.children && cat.children.length > 0 && (
                <div className="space-y-1.5">
                  {cat.children.slice(0, 5).map((subCat) => (
                    <Link key={subCat.id} href={`/category/${subCat.slug}`} className="block text-sm text-primary hover:text-accent transition-colors">
                      {subCat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {priceCategory && priceCategory.children && <PriceRangeList priceCategories={priceCategory.children} />}
    </div>
  );
});
MegaPanel.displayName = "MegaPanel";

const CategoryMegaMenu = memo(() => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchCategories();
        if (cancelled) return;
        setCategories(data);
        if (data[0]) setActiveCategory(data[0]);
      } catch (error) {
        if (!cancelled) console.error("Error fetching categories:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 120);
  }, []);

  const handleCategoryHover = useCallback((category: Category) => {
    setActiveCategory(category);
  }, []);

  const handlePanelClick = useCallback(() => setIsOpen(false), []);

  if (loading) {
    return (
      <button className="p-2 hover:bg-white/15 rounded-lg flex items-center gap-2 text-white">
        <Menu className="w-5 h-5" />
        <span className="text-sm">Đang tải...</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Trigger — white text on blue */}
      <button
        className={[
          "p-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors duration-150 text-white",
          "backdrop-blur-md border border-white/30",
          isOpen ? "bg-white/35" : "bg-white/20 hover:bg-white/30",
        ].join(" ")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={["transition-transform duration-200", isOpen ? "rotate-90" : "rotate-0"].join(" ")}>
          <path d="M4.7041 4H10.7041V10H4.7041V4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.7041 4H20.7041V10H14.7041V4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.7041 14H10.7041V20H4.7041V14Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M14.7041 17C14.7041 17.7956 15.0202 18.5587 15.5828 19.1213C16.1454 19.6839 16.9085 20 17.7041 20C18.4998 20 19.2628 19.6839 19.8254 19.1213C20.388 18.5587 20.7041 17.7956 20.7041 17C20.7041 16.2044 20.388 15.4413 19.8254 14.8787C19.2628 14.3161 18.4998 14.3161 15.5828 14.8787C15.0202 15.4413 14.7041 16.2044 14.7041 17Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-medium cursor-pointer whitespace-nowrap">Danh mục</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={["transition-transform duration-200", isOpen ? "rotate-180" : "rotate-0"].join(" ")}>
          <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown panel — neutral bg, not blue */}
      <div
        className={[
          "absolute left-0 top-full mt-2 flex rounded-2xl shadow-2xl z-50 overflow-hidden",
          "origin-top-left",
          "transition-[opacity,transform] duration-200 ease-out",
          isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
        style={{ height: "520px", width: "1264px" }}
        onClick={handlePanelClick}
      >
        {/* CategoryList nhận categories là stable ref → memo có tác dụng */}
        <CategoryList categories={categories} activeCategory={activeCategory} onHover={handleCategoryHover} />
        {/* MegaPanel chỉ re-render khi activeCategory thực sự thay đổi */}
        <MegaPanel category={activeCategory} />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgb(var(--neutral-dark)); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgb(var(--neutral-dark-hover)); }
      `}</style>
    </div>
  );
});
CategoryMegaMenu.displayName = "CategoryMegaMenu";

export default CategoryMegaMenu;
