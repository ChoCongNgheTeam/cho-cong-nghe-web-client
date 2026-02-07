"use client";

import WishlistHeart from "@/components/wishlist/WishlistHeart";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  return (
    <div className="relative border rounded-xl p-3 hover:shadow-md transition">
      <WishlistHeart productId={product.id} />

      <img
        src={product.image}
        alt={product.name}
        className="w-full h-44 object-contain"
      />

      <h3 className="mt-2 text-sm line-clamp-2">
        {product.name}
      </h3>

      <p className="mt-1 text-red-600 font-semibold">
        {product.price.toLocaleString()}đ
      </p>
    </div>
  );
}
