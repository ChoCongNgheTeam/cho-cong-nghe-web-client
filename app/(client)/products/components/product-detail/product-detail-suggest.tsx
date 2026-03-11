"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/components/product/types";
import apiRequest from "@/lib/api";

export default function ProductDetailSuggest({ slug }: { slug: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!slug) return;

    const fetchRelated = async () => {
      try {
        const data = await apiRequest.get<{ data: Product[] }>(
          `/products/slug/${slug}/related`,
          { noAuth: true },
        );
        console.log(
          "raw data:",
          data.data?.map((p) => p.id),
        ); // xem id nào bị trùn
        // Dedupe theo id phòng API trả về trùng
        const unique = Array.from(
          new Map((data.data || []).map((item) => [item.id, item])).values(),
        );

        setProducts(unique);
      } catch (err) {
        console.error("Lỗi gọi API:", err);
      }
    };

    fetchRelated();
  }, [slug]);

  if (products.length === 0) return null;

  return (
    <div className="container mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-4 lg:py-8 bg-neutral-light rounded-lg">
      <h1 className="text-xl sm:text-2xl font-semibold text-primary mb-6">
        Sản phẩm tương tự
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
