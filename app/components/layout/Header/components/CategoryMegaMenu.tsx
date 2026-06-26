"use client";

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Smartphone, Package, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Category } from "../types";
import { fetchCategories } from "../_libs/header";
import { BRAND_ICONS, CATEGORY_ICONS } from "../_libs/constants";

/* ── Sub-components giữ nguyên ── */
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
        <div key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-promotion border border-promotion rounded-full hover:shadow-md transition-all cursor-pointer">
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
    <div className="w-64 bg-[#f9f9f9] border-r border-neutral/60 flex flex-col h-full overflow-y-auto shrink-0">
      {categories.map((category) => {
        const Icon = getIcon(category.slug);
        const isActive = activeCategory?.id === category.id;
        return (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            onMouseEnter={() => onHover(category)}
            className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all border-l-4 ${
              isActive ? "bg-white border-accent-dark text-primary" : "border-transparent hover:bg-white text-primary"
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

const MegaPanel = memo(({ category, onClose }: { category: Category | null; onClose: () => void }) => {
  if (!category) return null;
  const brands = category.children?.filter((c) => ["apple-iphone", "samsung", "xiaomi", "oppo", "honor"].includes(c.slug));
  const hotItems =
    category.slug === "dien-thoai"
      ? [{ name: "iPhone 16 Series", badge: "HOT" }, { name: "Galaxy S25", badge: "MỚI" }, { name: "Xiaomi 15 Pro" }, { name: "OPPO Find X8" }, { name: "Điện thoại gập" }]
      : [];
  const priceCategory = category.children?.find((c) => c.slug === "theo-phan-khuc-gia");
  const mainCategories = category.children?.filter((c) => c.slug !== "theo-phan-khuc-gia" && c.slug !== "theo-nhu-cau");

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto custom-scrollbar h-full" onClick={onClose}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-active rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
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
                  {cat.children.slice(0, 5).map((sub) => (
                    <Link key={sub.id} href={`/category/${sub.slug}`} className="block text-sm text-primary hover:text-accent transition-colors">
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {priceCategory?.children && <PriceRangeList priceCategories={priceCategory.children} />}
    </div>
  );
});
MegaPanel.displayName = "MegaPanel";

/* ════════════════════════════════════════════════════════════
   PORTAL: Backdrop + Panel — render thẳng vào <body>
════════════════════════════════════════════════════════════ */
interface MenuPortalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  activeCategory: Category | null;
  onCategoryHover: (c: Category) => void;
  /** top offset tính từ đầu viewport để panel bắt đầu ngay dưới header */
  triggerBottom: number;
}

const MenuPortal = memo(({ isOpen, onClose, categories, activeCategory, onCategoryHover, triggerBottom }: MenuPortalProps) => {
  const portalRoot = typeof document !== "undefined" ? document.body : null;

  if (!portalRoot) return null;

  return createPortal(
    <>
      {/* Backdrop — full viewport */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={["fixed inset-0 z-40 transition-[opacity] duration-300", isOpen ? "opacity-100 pointer-events-auto bg-black/55 backdrop-blur-[2px]" : "opacity-0 pointer-events-none"].join(" ")}
      />

      {/* Panel — căn giữa theo viewport */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          top: triggerBottom,
          left: "50%",
          transform: isOpen ? "translateX(-50%) scaleY(1)" : "translateX(-50%) scaleY(0.96)",
          width: "min(1264px, calc(100vw - 32px))",
          height: "520px",
          transformOrigin: "top center",
          zIndex: 50,
        }}
        className={[
          "flex rounded-2xl overflow-hidden",
          "shadow-[0_24px_64px_rgba(0,0,0,0.32)]",
          "transition-[opacity,transform] duration-200 ease-out",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <CategoryList categories={categories} activeCategory={activeCategory} onHover={onCategoryHover} />
        <MegaPanel category={activeCategory} onClose={onClose} />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgb(var(--neutral-dark)); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgb(var(--neutral-dark-hover)); }
      `}</style>
    </>,
    document.body,
  );
});
MenuPortal.displayName = "MenuPortal";

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const CategoryMegaMenu = memo(() => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggerBottom, setTriggerBottom] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* fetch */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchCategories();
        if (cancelled) return;
        setCategories(data);
        if (data[0]) setActiveCategory(data[0]);
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ESC */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev && buttonRef.current) {
        // tính vị trí bottom của button để panel hiện ngay dưới
        const rect = buttonRef.current.getBoundingClientRect();
        setTriggerBottom(rect.bottom + 8); // 8px gap
      }
      return !prev;
    });
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleCategoryHover = useCallback((c: Category) => setActiveCategory(c), []);

  if (loading) {
    return (
      <button className="p-2 hover:bg-white/15 rounded-lg flex items-center gap-2 text-white">
        <span className="text-sm">Đang tải...</span>
      </button>
    );
  }

  return (
    <>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
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

      {/* Portal — backdrop + panel ra ngoài DOM tree */}
      <MenuPortal isOpen={isOpen} onClose={handleClose} categories={categories} activeCategory={activeCategory} onCategoryHover={handleCategoryHover} triggerBottom={triggerBottom} />
    </>
  );
});
CategoryMegaMenu.displayName = "CategoryMegaMenu";

export default CategoryMegaMenu;
