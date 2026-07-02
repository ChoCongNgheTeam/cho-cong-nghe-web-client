"use client";

import ProductCard from "@/components/product/ProductCard";
import { Slidezy } from "@/components/slider";
import { FeaturedProduct } from "@/(client)/home/_lib/types";

export function FeaturedProducts({ products }: { products: FeaturedProduct[] }) {
  return (
    <section className="py-2 md:py-4">
      <div className="container">
        <div className="bg-surface rounded-2xl overflow-hidden">
          <div className="px-5 md:px-7 pt-5 md:pt-6 pb-4 border-b border-surface-border flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-accent shrink-0" />
            <h2 className="text-lg md:text-xl font-bold text-primary tracking-tight">Sản phẩm nổi bật</h2>
          </div>

          {/* Slider */}
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
                <ProductCard key={product.id} product={{ ...product, thumbnail: product.thumbnail ?? "" }} index={index} />
              ))}
            </Slidezy>
          </div>
        </div>
      </div>
    </section>
  );
}
