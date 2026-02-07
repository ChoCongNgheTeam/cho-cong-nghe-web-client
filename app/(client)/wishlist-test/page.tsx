"use client";

import WishlistHeart from "../../components/shared/WishlistHeart";
import { WishlistProduct } from "./types/wishlist";

const MOCK_PRODUCTS: WishlistProduct[] = Array.from({ length: 12 }).map(
  (_, i) => ({
    id: i + 1,
    name: `Sản phẩm test ${i + 1}`,
    price: 12990000 + i * 500000,
    image: "/images/mock-product.png", // bạn để 1 ảnh test
  })
);

export default function WishlistTestPage() {
  return (
    <section className="container py-6">
      <h1 className="text-xl font-semibold mb-6">
        Wishlist TEST (Heart + Layout)
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map((p) => (
          <div
            key={p.id}
            className="relative border rounded-xl p-3 bg-white dark:bg-[rgb(var(--neutral-light))]"
          >
            <WishlistHeart productId={p.id} />

            <img
              src={p.image}
              alt={p.name}
              className="w-full h-40 object-contain"
            />

            <h3 className="mt-2 text-sm line-clamp-2">
              {p.name}
            </h3>

            <p className="mt-1 font-semibold text-promotion">
              {p.price.toLocaleString()}₫
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
