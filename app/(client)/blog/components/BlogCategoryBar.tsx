"use client";

import Link from "next/link";
import clsx from "clsx";
import { BLOG_CATEGORIES } from "../_lib/blog-category";

type Props = {
  active?: string;
  className?: string;
  itemClassName?: string;
};

export default function BlogCategoryBar({ active, className, itemClassName }: Props) {
  return (
    <div className={clsx("flex flex-wrap gap-4 border-b border-gray-200 pb-3 text-sm", className)}>
      {BLOG_CATEGORIES.map((cat) => {
        const isActive = cat.key === active;

        return (
          <Link
            key={cat.key}
            href={`/blog?category=${cat.key}`}
            className={clsx(
              "pb-2 font-medium transition-colors",
              isActive
                ? "border-b-2 border-black text-black"
                : "text-gray-700 hover:text-black",
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
