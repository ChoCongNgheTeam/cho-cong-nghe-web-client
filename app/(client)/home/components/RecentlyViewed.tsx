"use client";

import { ProductDTO } from "@/lib/api-demo";
import FeaturedProductCard from "./products/FeaturedProductCard";
import { Slidezy } from "@/components/Slider";

interface RecentlyViewedProps {
   products: ProductDTO[];
}

export default function RecentlyViewed({ products }: RecentlyViewedProps) {
   if (products.length === 0) return null;

   return (
      <section className="py-4 md:py-6 bg-linear-to-b from-neutral-light to-white">
         <div className="container">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                     Sản phẩm đã xem
                  </h2>
                  <p className="text-primary-light-hover">
                     Lịch sử xem sản phẩm của bạn
                  </p>
               </div>

               <button className="hidden md:flex items-center gap-2 text-promotion font-bold hover:gap-3 transition-all duration-300">
                  <span>Xóa lịch sử</span>
                  <svg
                     className="w-5 h-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                     />
                  </svg>
               </button>
            </div>

            {/* Products Slider */}
            <Slidezy
               items={{ mobile: 2, tablet: 3, desktop: 4 }}
               gap={16}
               speed={300}
               loop={true}
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
      </section>
   );
}
