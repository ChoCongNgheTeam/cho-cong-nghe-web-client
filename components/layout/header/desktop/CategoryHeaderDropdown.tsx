"use client";

import { memo, useEffect, useState, RefObject } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { CATEGORY_ICONS } from "@/lib/api/header/constants";
import { Category } from "@/types/category";
import { useCategoryHover } from "@/hooks/useCategoryHover";

interface CategoryHeaderDropdownProps {
  categories: Category[];
  /** Ref của nút "Danh mục" trong header, dùng để neo vị trí dropdown */
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

export const CategoryHeaderDropdown = memo(function CategoryHeaderDropdown({ categories, anchorRef, onClose }: CategoryHeaderDropdownProps) {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const { hoveredCategory, activeChildren, colCount, isLoading, handleHover, clearHideTimer, scheduleHide, reset } = useCategoryHover();

  useEffect(() => setMounted(true), []);

  // Header đang fixed top-0 nên vị trí nút không đổi khi scroll (trừ khi header tự ẩn),
  // chỉ cần tính lại khi mount và khi resize.
  useEffect(() => {
    const updatePos = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const GAP = 8;
      setPos({ top: rect.bottom + GAP, left: rect.left });
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    return () => window.removeEventListener("resize", updatePos);
  }, [anchorRef]);

  const handleLinkClick = () => {
    reset();
    onClose();
  };

  if (!mounted || !pos) return null;

  return createPortal(
    <div
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 100000 }}
      className="flex bg-surface border border-surface-border rounded-xl shadow-2xl overflow-hidden"
      onMouseLeave={scheduleHide}
    >
      {/* Root list */}
      <div className="w-[220px] flex flex-col bg-surface">
        <div className="px-4 py-2.5 border-b border-surface-border">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Danh mục</span>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[420px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Package;
            const isHovered = hoveredCategory?.id === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onMouseEnter={() => handleHover(cat)}
                onClick={handleLinkClick}
                className={`flex items-center justify-between px-3 py-2.5 transition-all border-l-[3px] group ${
                  isHovered ? "bg-accent-light border-accent" : "border-transparent hover:bg-neutral-light"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 text-accent" />
                  <span className="text-[14px] font-medium text-primary leading-tight">{cat.name}</span>
                </div>
                {(cat._count?.children ?? 0) > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-dark group-hover:text-accent transition-colors shrink-0" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Flyout con — gộp chung 1 panel với root list, không tách portal riêng như ở Home */}
      {hoveredCategory && (
        <div className="w-[560px] border-l border-surface-border flex flex-col" onMouseEnter={clearHideTimer} onMouseLeave={scheduleHide}>
          <Link
            href={`/category/${hoveredCategory.slug}`}
            onClick={handleLinkClick}
            className="flex items-center justify-between px-5 py-3 border-b border-surface-border hover:bg-accent-light transition-colors group shrink-0"
          >
            <span className="text-base font-bold text-accent">{hoveredCategory.name}</span>
            <ChevronRight className="w-4 h-4 text-accent transition-transform group-hover:translate-x-0.5" />
          </Link>

          <div className="p-5 overflow-y-auto max-h-[420px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeChildren.length > 0 ? (
              <div className="grid gap-x-8 gap-y-6" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
                {activeChildren.map((child) => (
                  <div key={child.id} className="flex flex-col gap-2 min-w-0">
                    <Link
                      href={`/category/${child.slug}`}
                      onClick={handleLinkClick}
                      className="text-[13px] font-bold text-primary hover:text-accent transition-colors pb-2 border-b border-surface-border leading-snug"
                    >
                      {child.name}
                    </Link>
                    <div className="flex flex-col gap-1.5">
                      {child.children?.map((sub) => (
                        <Link key={sub.id} href={`/category/${sub.slug}`} onClick={handleLinkClick} className="text-[14px] text-primary hover:text-accent transition-colors leading-snug">
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-primary text-center py-6">Không có danh mục con</p>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
});
