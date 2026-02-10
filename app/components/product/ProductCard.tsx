"use client";

import WishlistHeart from "@/components/shared/WishlistHeart";

type Props = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export default function ProductCard({
  id,
  name,
  price,
  image,
}: Props) {
  return (
    <div
      className="
        relative
        rounded-2xl
        border border-neutral-light
        bg-white
        dark:bg-[rgb(var(--neutral-light))]
        p-3
        transition
        hover:shadow-lg
      "
    >
      {/* ❤️ Wishlist */}
      <WishlistHeart
        productId={id}
        product={{ id, name, price, image }}
      />

      {/* Image */}
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-neutral-light">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <h3 className="text-sm line-clamp-2 text-neutral-dark">
          {name}
        </h3>

        <p className="font-semibold text-promotion">
          {price.toLocaleString()}₫
        </p>
      </div>
    </div>
  );
}
