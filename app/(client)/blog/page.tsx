"use client";

import { useState } from "react";

import BlogFeatured from "./components/blog-featured";
import BlogNews from "./components/blog-news";
import RelatedProducts from "./components/related-products";
import BlogCategorySlider from "./components/blog-category-slider";
import { BlogCategory } from "./_lib/blog.type";

export default function BlogPage() {
  // ✅ STATE CATEGORY ĐẶT Ở PAGE
  const [category, setCategory] = useState<BlogCategory>("featured");

  return (
    <div className="container py-6 space-y-8">
      {/* ===== BREADCRUMB ===== */}
      <div className="text-sm text-secondary">
        Trang chủ / <span className="text-primary font-medium">Tin tức</span>
      </div>

      {/* ===== TABS TEXT (nếu muốn giữ) ===== */}
      <div className="flex gap-6 overflow-x-auto border-b border-neutral pb-3">
        {[
          "Nổi bật",
          "Tin mới",
          "Khuyến mãi",
          "Đánh giá",
          "Thủ thuật",
          "Giải trí",
        ].map((item) => (
          <button
            key={item}
            className="text-sm font-medium whitespace-nowrap text-secondary hover:text-accent"
          >
            {item}
          </button>
        ))}
      </div>

      {/* ===== FEATURED (chỉ hiện khi chọn featured) ===== */}
      {category === "featured" && <BlogFeatured />}

      {/* ===== SẢN PHẨM LIÊN QUAN ===== */}
      <RelatedProducts />

      {/* ===== TIN MỚI (lọc theo category) ===== */}
      <BlogNews category={category} />
      {}
     {/* ===== SLIDER DANH MỤC (Slidezy) ===== */}
      <BlogCategorySlider
        active={category}
        onChange={setCategory}
      />
    </div>
  );
}
