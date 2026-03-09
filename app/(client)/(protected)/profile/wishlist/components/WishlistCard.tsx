import WishlistHeart from "@/components/shared/WishlistHeart";
import { WishlistProduct } from "../types/wishlist";
import Image from "next/image";

type Props = {
  product: WishlistProduct;
  onToggle?: (liked: boolean) => void;
};

export default function WishlistCard({ product, onToggle }: Props) {
  const priceNumber = Number(product.price) || 0;

  return (
    <div className="relative rounded-xl border border-neutral bg-neutral-light p-3 shadow-sm transition hover:shadow-md">
      <WishlistHeart
        productVariantId={product.id}
        defaultLiked={true}
        onToggle={onToggle}
      />

      <div className="aspect-square w-full overflow-hidden rounded-lg bg-neutral">
        <Image
          src={product.image || "/images/mock-product.png"}
          alt={product.name}
          width={480}
          height={480}
          className="h-full w-full object-contain"
        />
      </div>

      <h3 className="mt-3 text-sm font-medium text-primary">{product.name}</h3>

      <p className="mt-1 text-sm font-semibold text-promotion">{priceNumber.toLocaleString()}đ</p>
    </div>
  );
}
