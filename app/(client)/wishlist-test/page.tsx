"use client";

import ProductCard from "@/components/product/ProductCard";
import { WishlistProduct } from "../profile/wishlist/types/wishlist";

const MOCK_PRODUCTS: WishlistProduct[] = Array.from({ length: 12 }).map(
  (_, i) => ({
    id: i + 1,
    name: `Sản phẩm test ${i + 1}`,
    price: 12990000 + i * 500000,
    image: "/images/mock-product.png",
  })
);

export default function WishlistTestPage() {
  return (
    <section className="container py-6">
      <h1 className="text-xl font-semibold mb-6">
        Wishlist TEST
      </h1>

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-6
        "
      >
        {MOCK_PRODUCTS.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price}
            image={p.image}
          />
        ))}
      </div>
    </section>
  );
}
