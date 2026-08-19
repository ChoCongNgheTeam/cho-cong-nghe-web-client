"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { Slidezy } from "@/components/slider";
import { getBoughtTogetherProducts, trackRecommendationClick } from "@/lib/recommendation";
import type { Product } from "@/components/product/types";

/**
 * "Khách mua cùng" — đặt cạnh ProductDetailSuggest ("Sản phẩm liên quan", vốn
 * là section có sẵn của module product, dùng /products/slug/:slug/related).
 * Đây là section MỚI, tín hiệu khác hẳn (đồng mua trong cùng đơn hàng qua
 * order_items — không phải chung category/brand), nên KHÔNG thay thế mà thêm
 * bên cạnh (đã chốt với Duy).
 */
export default function BoughtTogetherSection({ productId }: { productId: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    getBoughtTogetherProducts(productId, 8)
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .catch(() => {
        // im lặng nếu lỗi — section phụ, không chặn trải nghiệm xem sản phẩm
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (products.length === 0) return null;

  return (
    <div className="w-full px-3 sm:px-6 lg:px-12 py-5 lg:py-10 bg-neutral-light rounded-xl mt-4">
      <h2 className="text-base sm:text-lg md:text-2xl font-semibold text-primary mb-4 sm:mb-6 md:mb-8">Khách hàng cũng mua</h2>

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
          <div key={product.id} onClick={() => trackRecommendationClick(product.id, "BOUGHT_TOGETHER")}>
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </Slidezy>
    </div>
  );
}
