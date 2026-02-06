"use client";

import Slidezy from "@/components/Slider/Slidezy";
import { BLOG_CATEGORIES } from "../_lib/blog-category";
import { BlogCategory } from "../_lib/blog.type";

type Props = {
  active: BlogCategory;
  onChange: (c: BlogCategory) => void;
};

export default function BlogCategorySlider({ active, onChange }: Props) {
  return (
    <section className="mt-20 mb-20">
      <Slidezy items={3} gap={16}>
        {BLOG_CATEGORIES.map((item) => (
          <div key={item.key} className="shrink-0">
            <button
              onClick={() => onChange(item.key)}
              className="
                relative
                h-55
                w-full
                overflow-hidden
                rounded-2xl
                group
              "
            >
              <img
                src={item.image}
                alt={item.title}
                className="
                  absolute inset-0
                  h-full w-full
                  object-cover
                  transition
                  group-hover:scale-105
                "
              />

              <div className="absolute inset-0 bg-black/40" />

              <div className="absolute bottom-4 left-4 text-white text-left">
                <h3 className="text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="text-sm opacity-90">
                  {item.total} bài viết
                </p>
              </div>
            </button>
          </div>
        ))}
      </Slidezy>
    </section>
  );
}
