import { featuredProducts } from "../../data/featuredProducts";
import StarIcon from "../ui/StarIcons";
import Button from "../ui/button";

type Product = (typeof featuredProducts)[number];

type ProductCardProps = {
  product: Product;
};

const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " đ";

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.variant.originalPrice - product.variant.price;

  const discountPercent = Math.round(
    ((product.variant.originalPrice - product.variant.price) /
      product.variant.originalPrice) *
      100
  );

   return (
    <div
      className="
        h-[420px]
        bg-white dark:bg-color-neutral
        rounded-2xl
        p-4
        flex flex-col
        border border-transparent
        hover:border-red-100
        shadow-[0_1px_4px_rgba(0,0,0,0.08)]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]
        transition-all
      "
    >
      {/* IMAGE + SPECS */}
      <div className="relative h-37.5 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://th.bing.com/th/id/OIP.Mlwh_H7NhgRrom-aHx5n9QHaHa?w=176&h=180"
          alt={product.name}
          className="h-full object-contain -translate-x-4"
        />

        {/* SPECS */}
        <div className="absolute right-0 top-0 flex flex-col gap-3">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-[9px] text-gray-500"
            >
              <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                📷
              </div>
              <span className="leading-tight text-center">
                Độ phân giải<br />3MP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BADGE */}
      <span className="w-fit bg-yellow-400 text-xs font-semibold px-3 py-1 rounded-full mb-2">
        Còn 5/5 suất
      </span>

      {/* PRICE */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-red-600 font-bold text-lg leading-tight">
            {formatPrice(product.variant.price)}
          </div>
          <div className="text-gray-400 text-sm line-through">
            {formatPrice(product.variant.originalPrice)}
          </div>
        </div>

        <span className="w-10 h-10 bg-red-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
          -{discountPercent}%
        </span>
      </div>

      {/* RATING + SOLD (KHÓA CHIỀU CAO) */}
      <div className="h-[20px] flex items-center justify-between text-[11px] whitespace-nowrap mb-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon key={s} filled={s <= product.rating} />
          ))}
          <span className="text-gray-500 ml-1">(10)</span>
        </div>

        <span className="text-red-500 font-semibold">Đã bán 1.2k</span>
      </div>

      {/* NAME – KHÓA CHIỀU CAO */}
      <h3 className="text-sm font-medium leading-snug line-clamp-2 h-[40px] mb-3">
        {product.name}
      </h3>

      {/* BUTTON DÍNH ĐÁY */}
      <Button
        variant="yellow"
        className="mt-auto w-full py-2 rounded-xl text-sm font-bold"
      >
        Mua ngay
      </Button>
    </div>
  );
}