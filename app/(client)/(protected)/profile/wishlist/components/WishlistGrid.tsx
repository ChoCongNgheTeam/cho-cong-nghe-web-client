import { WishlistProduct } from "../types/wishlist";
import WishlistCard from "./WishlistCard";

type Props = {
  products: WishlistProduct[];
};

export default function WishlistGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-neutral bg-neutral-light p-6 text-sm text-primary-light">
        Chưa có sản phẩm yêu thích nào.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => (
        <WishlistCard key={p.id} product={p} />
      ))}
    </div>
  );
}
