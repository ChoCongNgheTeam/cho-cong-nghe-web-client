import Link from "next/link";
import { Product } from "../types";
import ProductHighlights from "./ProductHighlights";
import RatingStars from "./RatingStars";
import PriceDisplay from "./PriceDisplay";

interface ProductCardProps {
   product: Product;
   categorySlug: string;
}

const COLOR_HEX_MAP: Record<string, string> = {
   white: "#ffffff",
   black: "#000000",
   red: "#ff0000",
   pink: "#ffc0cb",
   blue: "#0000ff",
   green: "#00a36c",
   "alpine-green": "#4a6741",
   gold: "#ffd700",
   silver: "#c0c0c0",
   purple: "#800080",
};

export default function ProductCard({
   product,
   categorySlug,
}: ProductCardProps) {
   const productHref = `/products/${product.slug}`;

   const storageOptions =
      product.variantOptions?.find((v) => v.type === "storage")?.options ?? [];
   const colorOptions =
      product.variantOptions?.find((v) => v.type === "color")?.options ?? [];

   return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 relative group">
         {/* Badges */}
         <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {product.isNew && (
               <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  MỚI
               </span>
            )}
            {product.isFeatured && (
               <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <span>⭐</span>
                  <span>ĐỘC QUYỀN</span>
               </span>
            )}
         </div>

         {/* Product Image */}
         <Link href={productHref} className="block mb-3">
            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
               {product.thumbnail ? (
                  <img
                     src={product.thumbnail}
                     alt={product.name}
                     className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl select-none">
                     📱
                  </div>
               )}
            </div>
         </Link>

         {/* Product Name */}
         <Link href={productHref}>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors min-h-[3rem] text-sm">
               {product.name}
            </h3>
         </Link>

         {/* Rating */}
         {product.rating.count > 0 && (
            <div className="mb-3">
               <RatingStars
                  rating={product.rating.average}
                  count={product.rating.count}
               />
            </div>
         )}

         {/* Highlights */}
         {product.highlights.length > 0 && (
            <div className="mb-3">
               <ProductHighlights highlights={product.highlights.slice(0, 3)} />
            </div>
         )}

         {/* Color Options */}
         {colorOptions.length > 0 && (
            <div className="mb-3 flex items-center gap-2">
               {colorOptions.slice(0, 4).map((color) => (
                  <button
                     key={color.value}
                     className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors"
                     style={{
                        backgroundColor:
                           COLOR_HEX_MAP[color.value] ?? "#cccccc",
                     }}
                     title={color.label}
                     type="button"
                  />
               ))}
               {colorOptions.length > 4 && (
                  <span className="text-xs text-gray-500">
                     +{colorOptions.length - 4}
                  </span>
               )}
            </div>
         )}

         {/* Storage Options */}
         {storageOptions.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
               {storageOptions.map((storage, index) => (
                  <button
                     key={storage.value}
                     type="button"
                     className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        index === 0
                           ? "border-blue-500 bg-blue-50 text-blue-700"
                           : "border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50"
                     }`}
                  >
                     {storage.label}
                  </button>
               ))}
            </div>
         )}

         {/* Price */}
         <div className="mb-3">
            <PriceDisplay price={product.price} />
         </div>

         {/* Installment Badge */}
         <div className="mb-3">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg px-3 py-2">
               <p className="text-xs font-semibold text-blue-700">Trả góp 0%</p>
            </div>
         </div>

         {/* Promotion Info */}
         {product.price.hasPromotion && (
            <div className="mb-3 border-t pt-3">
               <div className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-blue-600 flex-shrink-0">🎁</span>
                  <div>
                     <p>Giảm 5% tối đa 200.000đ Hoặc</p>
                     <p>Giảm 50% tối đa 100.000đ qua Kredivo</p>
                  </div>
               </div>
            </div>
         )}

         {/* Compare Button */}
         <button
            type="button"
            className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
         >
            <span>⊕</span>
            <span>Thêm vào so sánh</span>
         </button>

         {/* Out of Stock Overlay */}
         {!product.inStock && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
               <div className="text-center">
                  <p className="text-red-600 font-semibold">Hết hàng</p>
                  <button
                     type="button"
                     className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                     Thông báo khi có hàng
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}
