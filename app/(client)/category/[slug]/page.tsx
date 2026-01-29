import { Suspense } from "react";
import ProductFilter from "../components/ProductFilter";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { ListFilter } from "lucide-react";
import Link from "next/link";
import { Slidezy } from "@/components/Slider";

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

   const banners = [
      "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_6_e7dfc7282e.png",
      "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_2c3d95c752.png",
      "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_648d92f2e7.png",
      "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_81e57801fa.png",
      "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_89ee9818db.png",
      "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_a662c6cd0c.png",
   ];

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
               <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Điện thoại
               </h1>

               {/* Quick Filters */}
               <div className="flex items-center gap-3">
                  <span className="text-base text-primary">
                     Tìm sản phẩm theo nhu cầu
                  </span>
                  <span className="text-sm text-primary font-medium flex border rounded-full py-1.5 px-2 cursor-pointer gap-2">
                     <ListFilter width={17} height={17} />
                     Dùng bộ lọc ngay
                  </span>
               </div>
               <div className="w-fit border-b border-secondary-light mt-5">
                  <div className="flex items-center gap-6 overflow-x-auto py-3 text-sm font-medium">
                     <Link
                        href="/dien-thoai/dien-thoai-5g"
                        className="whitespace-nowrap text-gray-600 hover:text-red-500 hover:border-red-500 border-b-2 border-transparent pb-1 transition"
                     >
                        Điện thoại 5G
                     </Link>
                     <Link
                        href="/dien-thoai/dien-thoai-ai"
                        className="whitespace-nowrap text-gray-600 hover:text-red-500 hover:border-red-500 border-b-2 border-transparent pb-1 transition"
                     >
                        Điện thoại AI
                     </Link>
                     <Link
                        href="/dien-thoai/dien-thoai-gap"
                        className="whitespace-nowrap text-gray-600 hover:text-red-500 hover:border-red-500 border-b-2 border-transparent pb-1 transition"
                     >
                        Điện thoại gập
                     </Link>
                     <Link
                        href="/dien-thoai/gaming-phone"
                        className="whitespace-nowrap text-gray-600 hover:text-red-500 hover:border-red-500 border-b-2 border-transparent pb-1 transition"
                     >
                        Gaming phone
                     </Link>
                     <Link
                        href="/dien-thoai/pho-thong-4g"
                        className="whitespace-nowrap text-gray-600 hover:text-red-500 hover:border-red-500 border-b-2 border-transparent pb-1 transition"
                     >
                        Phổ thông 4G
                     </Link>
                  </div>
               </div>
               <Slidezy
                  items={1}
                  speed={500}
                  autoplay
                  autoplayTimeout={5000}
                  loop
                  nav
                  controls
                  className="rounded-lg overflow-hidden"
               >
                  {banners.map((img, idx) => (
                     <div
                        key={idx}
                        className="h-[140px] sm:h-[180px] md:h-[220px]"
                     >
                        <img
                           src={img}
                           alt={`Banner ${idx + 1}`}
                           className="w-full h-full object-cover"
                        />
                     </div>
                  ))}
               </Slidezy>
               <div className="mb-6 pb-6 border-b border-neutral">
                  <h4 className="text-sm font-semibold text-secondary mb-4">
                     Thương hiệu ưa chuộng
                  </h4>
                  <div className="grid grid-cols-6 gap-3">
                     {/* Row 1 */}
                     <a
                        href="/category/samsung"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <span className="text-lg font-bold text-[#1428A0]">
                           SAMSUNG
                        </span>
                     </a>
                     <a
                        href="/category/honor"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <span className="text-lg font-bold text-black">
                           HONOR
                        </span>
                     </a>
                     <a
                        href="/category/apple-iphone"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <span className="text-lg font-semibold text-black">
                           iPhone
                        </span>
                     </a>
                     <a
                        href="/category/tecno"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <span className="text-xl font-bold text-[#00A9E0]">
                           TECNO
                        </span>
                     </a>
                     <a
                        href="/category/nokia"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <span className="text-xl font-bold text-[#124191]">
                           NOKIA
                        </span>
                     </a>
                     <a
                        href="/category/viettel"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <span className="text-xl font-bold text-[#E30613]">
                           viettel
                        </span>
                     </a>

                     {/* Row 2 */}
                     <a
                        href="/category/oppo"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <span className="text-lg font-semibold text-[#00A368]">
                           oppo
                        </span>
                     </a>
                     <a
                        href="/category/redmagic"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <svg className="h-6" viewBox="0 0 120 30" fill="none">
                           <path
                              d="M5 15L15 5L25 15L15 25L5 15Z"
                              fill="#FF0000"
                           />
                           <text
                              x="30"
                              y="20"
                              className="text-sm font-bold"
                              fill="#FF0000"
                           >
                              REDMAGIC
                           </text>
                        </svg>
                     </a>
                     <a
                        href="/category/zte-nubia"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all gap-2"
                     >
                        <span className="text-lg font-bold text-[#0066CC]">
                           ZTE
                        </span>
                        <span className="text-lg font-bold text-[#E60012]">
                           nubia
                        </span>
                     </a>
                     <a
                        href="/category/masstel"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <span className="text-lg font-semibold text-[#FF6B00]">
                           Masstel
                        </span>
                     </a>
                     <a
                        href="/category/tcl"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <span className="text-2xl font-bold text-[#E30613]">
                           TCL
                        </span>
                     </a>
                     <a
                        href="/category/benco"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all"
                     >
                        <span className="text-lg font-semibold text-[#FF6B35]">
                           benco
                        </span>
                     </a>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="container mx-auto px-4 py-6">
            <div className="flex gap-6">
               {/* Sidebar Filter */}
               <aside className="w-72 shrink-0 hidden lg:block">
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
