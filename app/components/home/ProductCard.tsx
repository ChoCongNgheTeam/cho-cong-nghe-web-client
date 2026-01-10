import { featuredProducts } from "../../data/featuredProducts";
import StarIcon from "../ui/StarIcons";
import HeartIcon from "../ui/HeartIcons";
import Button from "../ui/button";

type Product = (typeof featuredProducts)[number];

type ProductCardProps = {
  product: Product;
};

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " đ";

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.variant.originalPrice - product.variant.price;

  const discountPercent = Math.round(
    (discount / product.variant.originalPrice) * 100
  );

  return (
   <div
  className="
   relative
    bg-white
    rounded-2xl
    shadow-sm
    p-4
    min-w-[240px]
    max-w-[260px]
    flex flex-col
    justify-between
    snap-start
    hover:shadow-md
    transition
  "
>
  {/* ===== IMAGE ===== */}
  <div className="w-full min-h-[160px] flex items-center justify-center mb-4">
  <img
    src="https://th.bing.com/th/id/OIP.Mlwh_H7NhgRrom-aHx5n9QHaHa?w=176&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3"
    alt={product.name}
    className="max-h-[150px] object-contain"
  />
</div>

  {}
  <div className="grid grid-cols-[1fr_44px] gap-3">
    {/* ===== LEFT CONTENT ===== */}
    <div>
      {/* Price */}
<div className="mb-2">
  <div className="flex items-end gap-2 flex-wrap">
    <span className="text-lg font-bold text-red-500 whitespace-nowrap">
      {formatPrice(product.variant.price)}
    </span>

    <span className="text-xs text-gray-400 line-through whitespace-nowrap">
      {formatPrice(product.variant.originalPrice)}
    </span>
  </div>

  <div className="flex gap-2 mt-1 text-xs flex-wrap">
    <span className="text-green-600 whitespace-nowrap">
      Giảm {formatPrice(discount)}
    </span>

    <span className="text-red-600 font-semibold whitespace-nowrap">
      -{discountPercent}%
    </span>
  </div>
</div>

      {/* Name */}
      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-4">
        {product.name}
      </h3>
    </div>

    {/* ===== RIGHT SPECS ===== */}
    <div className="flex flex-col items-center gap-3 text-[10px] text-gray-500">
      {["3MP", "3MP", "3MP"].map((spec, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center opacity-70">
            ⚙
          </div>
          <span>{spec}</span>
        </div>
      ))}
    </div>
  </div>

  {/* ===== RATING + HEART ===== */}
  <div className="flex items-center justify-between mt-3 mb-4">
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon key={s} filled={s <= product.rating} />
      ))}
      <span className="text-xs text-gray-400 ml-1">(10)</span>
    </div>

    <HeartIcon className="w-5 h-5 text-red-400 cursor-pointer" />
  </div>

  {/* ===== CTA ===== */}
  <Button
    variant="yellow"
    clickSymbol="🛒"
    notificationMessage={`Đã thêm ${product.name} vào giỏ hàng`}
    className="w-full py-2 font-bold rounded-xl"
  >
    Mua ngay
  </Button>
</div>

  );
}
