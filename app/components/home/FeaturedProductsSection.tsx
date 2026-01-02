"use client";

import { featuredProducts } from "../../data/featuredProducts";
import Button from "../ui/button";
import ProductCard from "./ProductCard";

// Format giá: 1.390.000 đ
const formatPrice = (price: number) =>
  price.toLocaleString("vi-VN") + " đ";

export default function FeaturedProductsSection() {
  const mainProduct = featuredProducts[0];
  const productList = featuredProducts.slice(1);

  return (
    <section className="bg-[#fdf2f2] py-8 mb-6 rounded-lg">
      <div className="container mx-auto px-6">
        <div className="flex gap-8">

          {/* ================= LEFT SIDEBAR ================= */}
          <aside className="w-72 flex-shrink-0 space-y-6">

            {/* Banner */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-300 text-orange-600 font-bold text-sm px-3 py-1 rounded-bl-2xl">
                -{mainProduct.variant.discount}%
              </div>

              <h3 className="text-2xl font-bold mb-2">Ưu đãi đặc biệt</h3>
              <p className="text-sm mb-4 opacity-90">
                Tiết kiệm đến {mainProduct.variant.discount}%
              </p>

              <Button
                variant="yellow"
                className="bg-white text-orange-600 hover:bg-gray-100"
              >
                Mua ngay
              </Button>
            </div>

            {/* Product nổi bật */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-5xl">
                📺
              </div>

              <h4 className="font-medium text-sm mb-3 line-clamp-2">
                {mainProduct.name}
              </h4>

              <div className="mb-4">
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(mainProduct.variant.price)}
                </span>
                <span className="block text-sm text-gray-400 line-through">
                  {formatPrice(mainProduct.variant.originalPrice)}
                </span>
              </div>

              <Button variant="yellow" className="w-full">
                Mua ngay
              </Button>
            </div>
          </aside>

          {/* ================= RIGHT CONTENT ================= */}
          <main className="flex-1">

            {/* Tabs */}
<div className="flex justify-center mb-6">
  <div className="flex gap-6 border-b border-gray-200">
    <button className="font-medium text-gray-900 border-b-2 border-yellow-400 pb-3">
      Mới bán
    </button>
    <button className="text-gray-500 hover:text-gray-900 pb-3">
      Đang giảm giá
    </button>
    <button className="text-gray-500 hover:text-gray-900 pb-3">
      Sản phẩm mới
    </button>
  </div>
</div>


            {/* Product grid – DÙNG COMPONENT CHUNG */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

          </main>
        </div>
      </div>
    </section>
  );
}
