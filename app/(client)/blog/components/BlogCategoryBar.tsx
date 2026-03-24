"use client";

import Link from "next/link";
import clsx from "clsx";
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
  const categoryItems =
    categories && categories.length > 0
      ? [{ key: "", title: "Tất cả" }, ...categories.map((item) => ({ key: item.slug, title: item.name }))]
      : BLOG_CATEGORIES;

  return (
    <div className={clsx("flex flex-wrap gap-2 border-b border-neutral pb-2 text-xs sm:gap-3 sm:pb-3 sm:text-sm md:gap-4", className)}>
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
  );
}

