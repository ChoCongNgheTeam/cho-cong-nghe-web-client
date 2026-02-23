"use client";

import { ProductDTO } from "@/lib/api-demo";
import FeaturedProductCard from "./FeaturedProductCard";
import { Slidezy } from "@/components/Slider";

interface BestSellersProps {
   products: ProductDTO[];
}

export default function BestSellers({ products }: BestSellersProps) {
   return (
      <section className="py-6 md:py-6 bg-neutral-light">
         <div className="container">
            {/* Outer Frame */}
            <div className="rounded-2xl border-2 border-neutral-hover p-5 md:p-6">
               {/* Section Header */}
               <div className="mb-3">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                     Sản phẩm bán chạy
                  </h2>
               </div>
               <Slidezy
                  items={{ mobile: 2, tablet: 3, desktop: 4 }}
                  gap={16}
                  speed={300}
                  loop={false}
                  nav={true}
                  controls={true}
                  slideBy={1}
                  draggable={true}
               >
                  {products.map((product, index) => (
                     <FeaturedProductCard
                        key={product.product.id}
                        product={product}
                        index={index}
                     />
                  ))}
               </Slidezy>
            </div>
         </div>
      </section>
   );
}
