"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { Slidezy } from "@/components/slider";
import { getForYouProducts, trackRecommendationClick } from "@/lib/recommendation";
import type { Product } from "@/components/product/types";
import type { RecommendationAlgorithm } from "@/lib/recommendation/types";

/**
 * "Có thể bạn thích" — tự fetch dữ liệu ở client (khác với các section khác
 * của trang chủ vốn nhận props từ getHomePageData() ở server) vì cần tín hiệu
 * chỉ có ở client: cookie consent + sessionId ẩn danh (khách chưa đăng nhập),
 * hoặc Bearer token hiện tại (khách đã đăng nhập, apiRequest tự đính kèm).
 */
export function RecommendedForYou() {
  const [products, setProducts] = useState<Product[]>([]);
  const [algorithmById, setAlgorithmById] = useState<Record<string, RecommendationAlgorithm>>({});

  useEffect(() => {
    let cancelled = false;

    getForYouProducts(12)
      .then((result) => {
        if (cancelled) return;
        setProducts(result.products);
        setAlgorithmById(result.algorithmById);
      })
      .catch(() => {
        // im lặng nếu lỗi — đây là section phụ, không nên chặn/làm xấu cả trang chủ
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-2 md:py-4">
      <div className="container">
        <div className="bg-surface rounded-2xl overflow-hidden">
          <div className="px-5 md:px-7 pt-5 md:pt-6 pb-4 border-b border-surface-border flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-accent shrink-0" />
            <h2 className="text-lg md:text-xl font-bold text-primary tracking-tight">Có thể bạn thích</h2>
          </div>

          <div className="px-3 md:px-5 py-4">
            <Slidezy
              items={{ mobile: 2, tablet: 2, lg: 3, desktop: 4 }}
              gap={16}
              speed={300}
              loop={false}
              nav={false}
              mobileNav="none"
              controls={{ mobile: false, tablet: false, lg: true, desktop: true }}
              slideBy={1}
              draggable={true}
            >
              {products.map((product, index) => (
                <div key={product.id} onClick={() => trackRecommendationClick(product.id, algorithmById[product.id] ?? "FALLBACK")}>
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </Slidezy>
          </div>
        </div>
      </div>
    </section>
  );
}
