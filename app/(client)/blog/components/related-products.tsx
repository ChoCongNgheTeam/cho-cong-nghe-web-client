import { RELATED_PRODUCTS } from "../_lib/mock-products";

const formatPrice = (price: number) =>
  price.toLocaleString("vi-VN") + " đ";

export default function RelatedProducts() {
  return (
    <section className="mt-20 space-y-4">
      <h2 className="text-2xl font-semibold">Sản phẩm mới</h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {RELATED_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="min-w-65 flex items-center gap-4 rounded-xl border border-neutral p-4 hover:shadow-sm transition"
          >
            {/* image */}
            <img
              src={product.image}
              alt={product.name}
              className="w-[72px] h-[96px] object-contain"
            />

            {/* info */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium line-clamp-2">
                {product.name}
              </h3>
              <p className="text-primary font-semibold">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
