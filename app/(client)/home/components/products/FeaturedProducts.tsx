"use client";

import ProductCard from "@/components/product/ProductCard";
import { FeaturedProduct } from "../../_libs";
import { Slidezy } from "@/components/Slider";

interface FeaturedProductsProps {
  products: FeaturedProduct[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-8 md:py-8 bg-neutral-light-active">
      <div className="container">
        <div className="rounded-2xl sm:p-4 md:p-6">
          <div className="mb-3">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">Sản phẩm nổi bật</h2>
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
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </Slidezy>
        </div>
      </div>
    </section>
  );
}
