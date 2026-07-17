"use client";

import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { CATEGORY_ICONS } from "@/lib/api/header/constants";
import { Category } from "@/types/category";
import { useCategoryHover } from "@/hooks/useCategoryHover";

interface SidebarCategoryListProps {
  categories: Category[];
  isHighlighted?: boolean;
  onClose?: () => void;
  /**
   * Truyền ref của wrapper ngoài cùng (chứa sidebar + slider).
   * Flyout sẽ stretch đúng đến cạnh phải của wrapper đó.
   */
  containerRef?: React.RefObject<HTMLElement>;
}

export const SidebarCategoryList = memo(function SidebarCategoryList({ categories, isHighlighted = false, onClose, containerRef }: SidebarCategoryListProps) {
  const { hoveredCategory, activeChildren, colCount, isLoading, handleHover, clearHideTimer, scheduleHide, reset } = useCategoryHover();

  const [flyoutPos, setFlyoutPos] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hoveredCategory || !rootRef.current) {
      setFlyoutPos(null);
      return;
    }

    const sidebarRect = rootRef.current.getBoundingClientRect();
    const GAP = 6;
    const left = sidebarRect.right + GAP;

    // Ưu tiên containerRef, fallback về slider element, cuối cùng về viewport
    let right: number;
    if (containerRef?.current) {
      right = containerRef.current.getBoundingClientRect().right;
    } else {
      // Tự tìm slider container gần nhất trong DOM
      const sliderEl = document.querySelector("[data-home-slider]");
      if (sliderEl) {
        right = sliderEl.getBoundingClientRect().right;
      } else {
        // Fallback: cùng cạnh phải với sidebar parent
        right = sidebarRect.right + Math.min(600, window.innerWidth - sidebarRect.right - 16);
      }
    }

    setFlyoutPos({
      top: sidebarRect.top + window.scrollY,
      left,
      width: Math.max(320, right - left),
      height: sidebarRect.height,
    });
  }, [hoveredCategory, containerRef]);

  // Đóng menu + reset flyout khi bấm vào bất kỳ link nào (root hoặc children)
  const handleLinkClick = () => {
    reset();
    onClose?.();
  };

  const flyout =
    hoveredCategory && flyoutPos
      ? createPortal(
          <div
            className="bg-surface border border-surface-border rounded-xl shadow-2xl overflow-hidden"
            style={{
              position: "absolute",
              top: flyoutPos.top,
              left: flyoutPos.left,
              width: flyoutPos.width,
              minHeight: flyoutPos.height,
              zIndex: 99999,
            }}
            onMouseEnter={clearHideTimer}
            onMouseLeave={scheduleHide}
          >
            {/* Header */}
            <Link
              href={`/category/${hoveredCategory.slug}`}
              onClick={handleLinkClick}
              className="flex items-center justify-between px-5 py-3 border-b border-surface-border hover:bg-accent-light transition-colors group"
            >
              <span className="text-base font-bold text-accent">{hoveredCategory.name}</span>
              <ChevronRight className="w-4 h-4 text-accent transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Body */}
            <div className="p-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activeChildren.length > 0 ? (
                <div className="grid gap-x-8 gap-y-6" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
                  {activeChildren.map((child) => (
                    <div key={child.id} className="flex flex-col gap-2 min-w-0">
                      {/* Child heading */}
                      <Link
                        href={`/category/${child.slug}`}
                        onClick={handleLinkClick}
                        className="text-[13px] font-bold text-primary hover:text-accent transition-colors pb-2 border-b border-surface-border leading-snug"
                      >
                        {child.name}
                      </Link>
                      {/* Grandchildren */}
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={`relative h-full transition-all duration-200 ${isHighlighted ? "z-50" : "z-0"}`} onMouseLeave={scheduleHide}>
      {/* Root list */}
      <div
        className={`h-full flex flex-col bg-surface border rounded-xl overflow-hidden transition-all duration-200 ${
          isHighlighted ? "border-accent/40 shadow-[0_0_0_2px_rgb(var(--accent)/0.2),0_8px_32px_rgba(0,0,0,0.18)]" : "border-surface-border"
        }`}
      >
        <div className="px-4 py-2.5 border-b border-surface-border">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Danh mục</span>
        </div>

        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

      {flyout}
    </div>
  );
});
