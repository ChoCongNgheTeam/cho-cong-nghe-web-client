// app/products/page.tsx
import ProductCard from "../product-card/product-card";

const products = [
  {
    id: "1",
    name: "Honor Play 10 4GB 128GB",
    slug: "honor-play-10-4gb-128gb",
    image: "/products/honor-play-10.png",
    price: 2590000,
    originalPrice: 2690000,
    discount: 100000,
    features: [
      { icon: "🔋", label: "Pin\n5000mAh" },
      { icon: "📱", label: "Màn hình\n6.74 inch" },
      { icon: "⚙️", label: "Helio G81" },
    ],
    colors: ["black", "green"],
  },
];

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}