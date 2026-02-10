import { WishlistProduct } from "../types/wishlist";
import WishlistCard from "./WishlistCard";

type Props = {
  products: WishlistProduct[];
};

export default function WishlistGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <WishlistCard key={p.id} product={p} />
      ))}
    </div>
  );
}
