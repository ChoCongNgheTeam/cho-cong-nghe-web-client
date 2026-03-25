"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { BLOG_CATEGORIES } from "../_lib/blog-category";
import { BlogCategory } from "../types/blog.type";

type Props = {
  active?: string;
  className?: string;
  itemClassName?: string;
  categories?: BlogCategory[];
};

export default function BlogCategoryBar({
  active,
  className,
  itemClassName,
  categories,
}: Props) {
  const activeKey = active ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const categoryItems =
    categories && categories.length > 0
      ? [{ key: "", title: "Tất cả" }, ...categories.map((item) => ({ key: item.slug, title: item.name }))]
      : BLOG_CATEGORIES;
  const activeLabel = categoryItems.find((cat) => cat.key === activeKey)?.title ?? "Tất cả";

  return (
    <>
      <div className={clsx("sm:hidden relative", className)}>
        {mobileOpen && (
          <button
            type="button"
            aria-label="Đóng danh mục"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-10 bg-primary-dark/20"
          />
        )}
        <div className="flex items-center justify-between gap-3 border-b border-neutral pb-2">
          <div>
            <p className="text-xs font-medium text-primary-light">Danh mục</p>
            <p className="text-sm font-semibold text-primary">{activeLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 hover:bg-accent-hover rounded-lg transition-colors"
            aria-label="Danh mục"
          >
            {mobileOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
          </button>
        </div>

        <div
          className={clsx(
            "absolute left-0 right-0 top-full z-20 mt-2 origin-top overflow-hidden rounded-lg border border-neutral bg-neutral-light shadow-lg transition-all duration-200",
            mobileOpen ? "max-h-96 opacity-100 scale-100" : "max-h-0 opacity-0 scale-95 pointer-events-none"
          )}
        >
          <div className="p-2">
            {categoryItems.map((cat) => {
              const isActive = cat.key === activeKey;
              const href = cat.key ? `/blog?category=${cat.key}&page=1` : "/blog";

              return (
                <Link
                  key={cat.key}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "block rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent-light text-primary"
                      : "text-primary-light hover:text-primary hover:bg-neutral-light-hover",
                    itemClassName
                  )}
                >
                  {cat.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className={clsx(
          "hidden flex-wrap gap-2 border-b border-neutral pb-2 text-xs sm:flex sm:gap-3 sm:pb-3 sm:text-sm md:gap-4",
          className
        )}
      >
        {categoryItems.map((cat) => {
          const isActive = cat.key === activeKey;
          const href = cat.key ? `/blog?category=${cat.key}&page=1` : "/blog";

          return (
            <Link
              key={cat.key}
              href={href}
              className={clsx(
                "pb-2 font-medium transition-colors",
                isActive
                  ? "border-b-2 border-accent text-primary"
                  : "text-primary-light hover:text-primary",
                itemClassName
              )}
            >
              {cat.title}
            </Link>
          );
        })}
      </div>
    </>
  );
}

