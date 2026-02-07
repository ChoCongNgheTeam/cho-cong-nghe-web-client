'use client';

import { ProductDTO } from '@/lib/api-demo';
import FeaturedProductCard from './FeaturedProductCard';

interface BestSellersProps {
  products: ProductDTO[];
}

export default function BestSellers({ products }: BestSellersProps) {
  // Limit to 4 products only
  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-8 md:py-12 bg-neutral-light">
      <div className="container mx-auto px-4">
        {/* Outer Frame */}
        <div className="border-2 border-neutral rounded-2xl p-6 md:p-8 bg-white shadow-sm">
          {/* Section Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary font-poppins">
              Sản phẩm bán chạy
            </h2>
          </div>

          {/* Products Grid - Always 4 columns on desktop, 2 on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((product, index) => (
              <FeaturedProductCard key={product.product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}