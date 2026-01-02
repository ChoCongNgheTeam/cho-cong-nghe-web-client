import { hotProducts } from "../../data/hotProducts";
import ProductCard from "@/components/home/ProductCard";

export default function HotSaleSection() {
  return (
    <div className="bg-[#fdf2f2] py-8 mb-6 rounded-lg">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {hotProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
