"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { BLOG_CATEGORY_TABS } from "../_lib/blog-category";

type Props = {
  active?: string;
  className?: string;
  itemClassName?: string;
};

export default function BlogCategoryBar({ active, className, itemClassName }: Props) {
  const activeKey = active ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLabel = BLOG_CATEGORY_TABS.find((t) => t.key === activeKey)?.title ?? "Tất cả";

  return (
    <>
      {/* Mobile dropdown */}
      <div className={clsx("sm:hidden relative", className)}>
        {mobileOpen && <button type="button" aria-label="Đóng danh mục" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-10 bg-primary-dark/20" />}
        <div className="flex items-center justify-between gap-3 border-b border-neutral pb-2">
          <div>
            <p className="text-xs font-medium text-primary-light">Danh mục</p>
            <p className="text-sm font-semibold text-primary">{activeLabel}</p>
          </div>
          <button type="button" onClick={() => setMobileOpen((prev) => !prev)} className="p-2 hover:bg-accent-hover rounded-lg transition-colors" aria-label="Danh mục">
            {mobileOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
          </button>
        </div>
        <div
          className={clsx(
            "absolute left-0 right-0 top-full z-20 mt-2 origin-top overflow-hidden rounded-lg border border-neutral bg-neutral-light shadow-lg transition-all duration-200",
            mobileOpen ? "max-h-96 opacity-100 scale-100" : "max-h-0 opacity-0 scale-95 pointer-events-none",
          )}
        >
          <div className="p-2">
            {BLOG_CATEGORY_TABS.map((tab) => {
              const isActive = tab.key === activeKey;
              const href = tab.key ? `/blog?type=${tab.key}&page=1` : "/blog";
              return (
                <Link
                  key={tab.key || "__all"}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "block rounded-md px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-accent-light text-primary font-semibold" : "text-primary-light hover:text-primary hover:bg-neutral-light-hover",
                    itemClassName,
                  )}
                >
                  {tab.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop tabs */}
      <div className={clsx("hidden flex-wrap gap-2 border-b border-neutral pb-2 text-xs sm:flex sm:gap-4 sm:pb-3 sm:text-sm", className)}>
        {BLOG_CATEGORY_TABS.map((tab) => {
          const isActive = tab.key === activeKey;
          const href = tab.key ? `/blog?type=${tab.key}&page=1` : "/blog";
          return (
            <Link
              key={tab.key || "__all"}
              href={href}
              className={clsx("pb-2 font-medium transition-colors whitespace-nowrap", isActive ? "border-b-2 border-accent text-primary" : "text-primary-light hover:text-primary", itemClassName)}
            >
              {tab.title}
            </Link>
          );
        })}
      </div>
    </>
  );
}
