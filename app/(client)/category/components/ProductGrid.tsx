import ProductCard from "./ProductCard";

interface Product {
   id: string;
   name: string;
   slug: string;
   thumbnail: string;
   inStock: boolean;
   rating: {
      average: number;
      count: number;
   };
   isFeatured: boolean;
   isNew: boolean;
   highlights: Array<{
      key?: string;
      name: string;
      icon: string;
      value: string;
   }>;
   variantOptions: Array<{
      type: string;
      options: Array<{
         value: string;
         label: string;
      }>;
   }>;
   price: {
      base: number;
      final: number;
      discountAmount: number;
      discountPercentage: number;
      hasPromotion: boolean;
   };
}

interface ProductGridProps {
   products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
   return (
      <div>
         {/* Sort and View Options */}
         <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
               <span className="text-sm text-gray-600">
                  Tìm thấy <strong>{products.length}</strong> kết quả
               </span>
               <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                     Nổi bật
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                     Giá tăng dần
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                     Giá giảm dần
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                     Trả góp 0%
                  </button>
               </div>
            </div>
         </div>

         {/* Product Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
               <ProductCard key={product.id} product={product} />
            ))}
         </div>

         {/* Pagination */}
         {products.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
               <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  Trước
               </button>
               <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  1
               </button>
               <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  2
               </button>
               <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  3
               </button>
               <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Sau
               </button>
            </div>
         )}
      </div>
   );
}
