import Link from "next/link";
import { Pagination, Product } from "../types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
   products: Product[];
   pagination?: Pagination;
   categorySlug: string;
}

type SortOption = {
   label: string;
   value: string;
};

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

   const buildPageHref = (page: number) =>
      `/category/${categorySlug}?page=${page}`;
   return (
      <div>
         {/* Sort Options */}
         <div className="flex items-center gap-4 flex-wrap mb-4 bg-white p-4 rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">
               Tìm thấy <strong>{total}</strong> kết quả
            </span>
            <div className="flex items-center gap-2 flex-wrap">
               {SORT_OPTIONS.map((option, index) => (
                  <button
                     key={option.value}
                     type="button"
                     className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        index === 0
                           ? "text-blue-600 bg-blue-50"
                           : "text-gray-700 hover:bg-gray-50"
                     }`}
                  >
                     {option.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Product Grid */}
         {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               {products.map((product) => (
                  <ProductCard
                     key={product.id}
                     product={product}
                     categorySlug={categorySlug}
                  />
               ))}
            </div>
         ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
               <span className="text-5xl mb-4">🔍</span>
               <p className="text-lg font-medium">Không tìm thấy sản phẩm</p>
               <p className="text-sm mt-1">Vui lòng thử lại với bộ lọc khác</p>
            </div>
         )}

         {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
               {currentPage > 1 ? (
                  <Link
                     href={buildPageHref(currentPage - 1)}
                     className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                     Trước
                  </Link>
               ) : (
                  <span className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-300 cursor-not-allowed select-none">
                     Trước
                  </span>
               )}

               {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) =>
                     page === currentPage ? (
                        <span
                           key={page}
                           className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
                        >
                           {page}
                        </span>
                     ) : (
                        <Link
                           key={page}
                           href={buildPageHref(page)}
                           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                           {page}
                        </Link>
                     ),
               )}

               {currentPage < totalPages ? (
                  <Link
                     href={buildPageHref(currentPage + 1)}
                     className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                     Sau
                  </Link>
               ) : (
                  <span className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-300 cursor-not-allowed select-none">
                     Sau
                  </span>
               )}
            </div>
         )}
      </div>
   );
}
