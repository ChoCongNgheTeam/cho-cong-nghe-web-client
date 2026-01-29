import { Suspense } from "react";
import ProductFilter from "../components/ProductFilter";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";

interface SearchParams {
   category?: string;
}

async function getProducts() {
   const res = await fetch(
      "http://localhost:5000/api/v1/products?category=dien-thoai",
      {
         cache: "no-store",
      },
   );

   if (!res.ok) {
      throw new Error("Failed to fetch products");
   }

   return res.json();
}

export default async function PhoneListingPage({
   searchParams,
}: {
   searchParams: SearchParams;
}) {
   const data = await getProducts();
   const products = data.data || [];

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header Section */}
         <div className="bg-white border-b">
            <div className="container mx-auto px-4 py-4">
               {/* Breadcrumb */}
               <nav className="text-sm mb-3">
                  <ol className="flex items-center space-x-2 text-gray-600">
                     <li>
                        <a href="/" className="hover:text-blue-600">
                           Trang chủ
                        </a>
                     </li>
                     <li>/</li>
                     <li className="text-gray-900 font-medium">Điện thoại</li>
                  </ol>
               </nav>

               {/* Title */}
               <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Điện thoại
               </h1>

               {/* Quick Filters */}
               <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                     Tìm sản phẩm theo nhu cầu
                  </span>
                  <div className="flex items-center gap-2">
                     <button className="px-4 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-sm font-medium transition-colors">
                        📱 NFC
                     </button>
                     <button className="px-4 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-sm font-medium transition-colors">
                        🔋 Pin trâu: trên 5500 mAh
                     </button>
                     <button className="px-4 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-sm font-medium transition-colors">
                        📡 5G
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="container mx-auto px-4 py-6">
            <div className="flex gap-6">
               {/* Sidebar Filter */}
               <aside className="w-72 flex-shrink-0 hidden lg:block">
                  <ProductFilter />
               </aside>

               {/* Product Grid */}
               <main className="flex-1">
                  <Suspense fallback={<ProductGridSkeleton />}>
                     <ProductGrid products={products} />
                  </Suspense>
               </main>
            </div>
         </div>
      </div>
   );
}
