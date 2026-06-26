"use client";

import ProductCard from "@/components/product/ProductCard";
import { Slidezy } from "@/components/Slider";
import { FeaturedProduct } from "../../_lib/types";

export function BestSellers({ products }: { products: FeaturedProduct[] }) {
  return (
    <section className="py-2 bg-neutral-light">
      <div className="container">
        <div className="rounded-2xl sm:p-4 md:p-6">
          <div className="mb-3">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">Sản phẩm bán chạy</h2>
          </div>
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
              <ProductCard key={product.id} product={{ ...product, thumbnail: product.thumbnail ?? "" }} index={index} />
            ))}
          </Slidezy>
        </div>
      </div>
    </section>
  );
}
