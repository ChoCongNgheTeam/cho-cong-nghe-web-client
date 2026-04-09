"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Smartphone, Laptop, Tv, Headphones, Settings, Home, Heart, Utensils, Wifi, Package, Sparkles, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import apiRequest from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  position: number;
  children: Category[];
}

interface ApiResponse {
  data: Category[];
  message: string;
}

function getIcon(slug: string) {
  const icons: Record<string, React.ElementType> = {
    "dien-thoai": Smartphone,
    laptop: Laptop,
    "dien-may": Tv,
    "phu-kien": Headphones,
    "cong-nghe-thiet-bi-so": Settings,
    "cham-soc-nha-cua-suc-khoe": Heart,
    "thiet-bi-gia-dinh-dien-gia-dung": Home,
    "thiet-bi-nha-bep": Utensils,
    "ket-noi-tien-ich-giai-tri": Wifi,
  };
  return icons[slug] || Package;
}

interface MobileCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileCategorySheet({ isOpen, onClose }: MobileCategorySheetProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Category | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Fetch categories once
  useEffect(() => {
    if (categories.length > 0) return;
    apiRequest
      .get<ApiResponse>("/categories/tree", { noAuth: true })
      .then((res) => {
        setCategories(res.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reset drill-down when sheet reopens
  useEffect(() => {
    if (isOpen) setSelected(null);
  }, [isOpen]);

  // Lock body scroll + dispatch event cho ChatButton ẩn/hiện
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    window.dispatchEvent(new CustomEvent("sheet:toggle", { detail: { open: isOpen } }));
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Swipe down to close
  const touchStartY = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy > 60) onClose();
    touchStartY.current = null;
  };

  // Main categories list (level 1)
  const renderList = () => (
    <div className="flex flex-col">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral">
              <div className="w-9 h-9 rounded-xl bg-neutral animate-pulse shrink-0" />
              <div className="h-3.5 w-36 rounded-full bg-neutral animate-pulse" />
            </div>
          ))
        : categories.map((cat) => {
            const Icon = getIcon(cat.slug);
            const hasChildren = cat.children && cat.children.length > 0;
            return (
              <button
                key={cat.id}
                onClick={() => hasChildren && setSelected(cat)}
                className="flex items-center justify-between px-4 py-3.5 border-b border-neutral
                  hover:bg-neutral-light-active active:bg-neutral transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-accent" />
                  </span>
                  <span className="text-sm font-medium text-primary">{cat.name}</span>
                </div>
                {hasChildren && <ChevronRight className="w-4 h-4 text-neutral-dark shrink-0" />}
              </button>
            );
          })}
    </div>
  );

  // Subcategory drill-down (level 2)
  const renderDetail = (cat: Category) => {
    const mainChildren = cat.children?.filter((c) => c.slug !== "theo-phan-khuc-gia" && c.slug !== "theo-nhu-cau") ?? [];
    const priceChildren = cat.children?.find((c) => c.slug === "theo-phan-khuc-gia")?.children ?? [];

    return (
      <div>
        {/* View all link */}
        <Link
          href={`/category/${cat.slug}`}
          onClick={onClose}
          className="flex items-center justify-between px-4 py-3.5 border-b border-neutral
            bg-accent/5 hover:bg-accent/10 transition-colors"
        >
          <span className="text-sm font-semibold text-accent">Xem tất cả {cat.name}</span>
          <ChevronRight className="w-4 h-4 text-accent" />
        </Link>

        {/* Sub-categories */}
        {mainChildren.map((sub) => (
          <div key={sub.id} className="border-b border-neutral last:border-0">
            {/* Sub-category header row */}
            <Link
              href={`/category/${sub.slug}`}
              onClick={onClose}
              className="flex items-center justify-between px-4 py-3
                hover:bg-neutral-light-active active:bg-neutral transition-colors"
            >
              <span className="text-sm font-semibold text-primary">{sub.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-dark shrink-0" />
            </Link>

            {/* Leaf chips — pill buttons */}
            {sub.children && sub.children.length > 0 && (
              <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2">
                {sub.children.slice(0, 6).map((leaf) => (
                  <Link
                    key={leaf.id}
                    href={`/category/${leaf.slug}`}
                    onClick={onClose}
                    className="
                      inline-flex items-center
                      px-3 py-1.5
                      text-xs font-medium text-primary
                      bg-neutral-light
                      border border-neutral
                      rounded-full
                      shadow-sm
                      hover:border-accent hover:text-accent hover:shadow-md
                      active:scale-95
                      transition-all duration-150
                    "
                  >
                    {leaf.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Price ranges */}
        {priceChildren.length > 0 && (
          <div className="px-4 py-4">
            <p className="text-xs font-semibold text-neutral-dark mb-3 flex items-center gap-1">💰 Theo mức giá</p>
            <div className="flex flex-wrap gap-2">
              {priceChildren.map((p) => (
                <Link
                  key={p.id}
                  href={`/category/${p.slug}`}
                  onClick={onClose}
                  className="px-3 py-1.5 bg-neutral-light border border-neutral rounded-full
                    text-xs font-medium text-primary hover:border-accent hover:text-accent transition-colors"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={["md:hidden fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300", isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={[
          "md:hidden fixed bottom-0 left-0 right-0 z-[110]",
          "bg-neutral-light rounded-t-2xl",
          "flex flex-col overflow-hidden",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        style={{
          maxHeight: "82vh",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Handle + Header */}
        <div className="shrink-0">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-neutral-dark/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral">
            {selected ? (
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary
                  hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Danh mục
              </button>
            ) : (
              <span className="text-base font-semibold text-primary">Danh mục</span>
            )}

            <div className="flex items-center gap-2">
              {selected && <span className="text-sm font-semibold text-primary">{selected.name}</span>}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral transition-colors text-primary" aria-label="Đóng">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">{selected ? renderDetail(selected) : renderList()}</div>
      </div>
    </>
  );
}
