import { featuredProducts } from "../../data/featuredProducts";
import StarIcon from "../ui/StarIcons";
import HeartIcon from "../ui/HeartIcons";
import Button from "../ui/button";

// 🔥 LẤY TYPE TỪ MOCK DATA
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
    white bg-[rgb(var(--card))]  text-[rgb(var(--foreground))]
 border border-gray-100 rounded-2xl p-4 shadow-sm relative flex flex-col"
    >
      {/* Specs */}
      <div className="absolute top-4 right-2 flex flex-col gap-2 items-center">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center text-[10px] text-gray-600"
          >
            <div className="w-5 h-5 mb-1 opacity-60">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
            <span className="leading-tight text-center">
              Độ phân giải
              <br />
              3MP
            </span>
          </div>
        ))}
      </div>

      {/* Image */}
      <div className="h-40 mb-4 flex items-center justify-center text-5xl">
        {product.brand === "Sony"
          ? "🎧"
          : product.brand === "Dell"
          ? "💻"
          : product.brand === "Apple"
          ? "⌚"
          : "📱"}
      </div>

      {/* Price */}
      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          {/* Giá bán */}
          <span className="text-base font-semibold text-gray-900">
            {formatPrice(product.variant.price)}
          </span>

          {/* Giá gốc */}
          <span className="text-xs text-gray-400 line-through">
            {formatPrice(product.variant.originalPrice)}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1">
          {/* Số tiền giảm */}
          <span className="text-green-600 text-xs font-medium">
            Giảm {formatPrice(discount)}
          </span>

          {/* % giảm */}
          <span className="text-red-500 text-sm font-semibold">
            -{discountPercent}%
          </span>
        </div>
      </div>

      {/* Rating + Heart */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} filled={star <= Math.floor(product.rating)} />
          ))}
          <span className="text-xs text-gray-400 ml-1">(10 đánh giá)</span>
        </div>

        <button className="text-red-400 hover:scale-110 transition-transform">
          <HeartIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Name */}
      <h3 className="text-[15px] font-medium text-gray-800 leading-snug mb-4 flex-grow line-clamp-2">
        {product.name}
      </h3>

      {/* CTA */}
      <Button
        variant="yellow"
        clickSymbol="🛒"
        notificationMessage={`Đã thêm ${product.name} vào giỏ hàng!`}
        className="w-full py-3 text-lg font-bold rounded-xl cursor-pointer"
      >
        mua ngay
      </Button>
    </div>
  );
}
