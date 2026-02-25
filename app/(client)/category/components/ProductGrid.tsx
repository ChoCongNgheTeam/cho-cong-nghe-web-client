import ProductCard from "@/components/product/ProductCard";
import Pagination from "@/components/Pagination";
import {
   Pagination as PaginationType,
   Product,
} from "@/components/product/types";

interface ProductGridProps {
   products: Product[];
   pagination?: PaginationType;
   categorySlug: string;
}
type SortOption = { label: string; value: string };
const SORT_OPTIONS: SortOption[] = [
   { label: "Nổi bật", value: "featured" },
   { label: "Giá tăng dần", value: "price_asc" },
   { label: "Giá giảm dần", value: "price_desc" },
];
export default function ProductGrid({
   products,
   pagination,
   categorySlug,
}: ProductGridProps) {
   const totalPages = pagination?.totalPages ?? 1;
   const currentPage = pagination?.page ?? 1;
   const total = pagination?.total ?? products.length;

   return (
      <div>
         {/* Sort Options */}
         <div className="flex items-center gap-4 flex-wrap mb-4 bg-neutral-light border border-neutral p-4 rounded-xl">
            <span className="text-sm text-primary-light">
               Tìm thấy <strong className="text-primary">{total}</strong> kết
               quả
            </span>
            <div className="flex items-center gap-2 flex-wrap">
               {SORT_OPTIONS.map((option, index) => (
                  <button
                     key={option.value}
                     type="button"
                     className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        index === 0
                           ? "text-accent bg-accent-light"
                           : "text-primary hover:bg-neutral-light-active"
                     }`}
                  >
                     {option.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Product Grid */}
         {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
               ))}
            </div>
         ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-neutral-light border border-neutral rounded-2xl">
               <span className="text-5xl mb-4">🔍</span>
               <p className="text-base font-semibold text-primary">
                  Không tìm thấy sản phẩm
               </p>
               <p className="text-sm text-primary-light mt-1">
                  Vui lòng thử lại với bộ lọc khác
               </p>
            </div>
         )}
         <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/category/${categorySlug}`}
            className="mt-8"
         />
      </div>
   );
}
