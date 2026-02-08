import WishlistHeart from "../../components/shared/WishlistHeart";
import { WishlistProduct } from "./types/wishlist";

type Props = {
  product: WishlistProduct;
};

export default function WishlistCard({ product }: Props) {
  return (
    <div className="relative border rounded-xl p-3 bg-white dark:bg-[rgb(var(--neutral-light))]">
      <WishlistHeart productId={product.id} />

      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-contain"
      />

      <h3 className="mt-2 text-sm line-clamp-2">
        {product.name}
      </h3>

      <p className="mt-1 font-semibold text-promotion">
        {product.price.toLocaleString()}₫
      </p>
    </div>
  );
}
