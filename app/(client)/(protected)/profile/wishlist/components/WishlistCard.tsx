import WishlistHeart from "@/components/shared/WishlistHeart";
import { WishlistProduct } from "../types/wishlist";

type Props = {
  product: WishlistProduct;
};

export default function WishlistCard({ product }: Props) {
  const priceNumber =
    typeof product.price === "number"
      ? product.price
      : Number(String(product.price).replace(/[^\d]/g, "")) || 0;

  return (
    <div className="relative rounded-xl border border-neutral bg-neutral-light p-3 shadow-sm transition hover:shadow-md">
      <WishlistHeart productId={product.id} product={product} />

      <div className="aspect-square w-full overflow-hidden rounded-lg bg-neutral">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain"
        />
      </div>

      <h3 className="mt-3 text-sm font-medium text-primary">
        {product.name}
      </h3>

      <p className="mt-1 text-sm font-semibold text-promotion">
        {priceNumber.toLocaleString()}đ
      </p>
    </div>
  );
}
