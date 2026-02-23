import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListFilter } from "lucide-react";
import type { Metadata } from "next";
import ProductFilter from "../components/ProductFilter";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { Slidezy } from "@/components/Slider";
import { Product, Pagination, PageProps } from "../types";
import { fetchProducts } from "../_libs/fetchProductByCategory";
import { slugToTitle } from "../components/SlugToTitle";
import { BANNERS, BRANDS, SUB_CATEGORIES } from "../MockData";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
export async function generateMetadata({
   params,
   searchParams,
}: PageProps): Promise<Metadata> {
   const { slug } = await params;
   const { page: pageParam } = await searchParams;
   const page = Math.max(1, Number(pageParam ?? 1) || 1);

   const categoryTitle = slugToTitle(slug);
   const siteName = "Shop của bạn";
   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";
   const title =
      page > 1
         ? `${categoryTitle} - Trang ${page} | ${siteName}`
         : `${categoryTitle} | ${siteName}`;
   const description = `Khám phá bộ sưu tập ${categoryTitle} đa dạng, chính hãng, giá tốt tại ${siteName}. Giao hàng nhanh, bảo hành uy tín.`;
   const canonicalUrl =
      page > 1
         ? `${baseUrl}/category/${slug}?page=${page}`
         : `${baseUrl}/category/${slug}`;
   return {
      title,
      description,
      alternates: {
         canonical: canonicalUrl,
      },
      openGraph: {
         title,
         description,
         url: canonicalUrl,
         siteName,
         locale: "vi_VN",
         type: "website",
      },
      twitter: {
         card: "summary_large_image",
         title,
         description,
      },
      robots:
         page > 1
            ? { index: false, follow: true }
            : { index: true, follow: true },
   };
}

export default async function CategoryPage({
   params,
   searchParams,
}: PageProps) {
   const { slug } = await params;
   const { page: pageParam } = await searchParams;
   const page = Math.max(1, Number(pageParam ?? 1) || 1);
   let products: Product[] = [];
   let pagination: Pagination | undefined;
   let fetchError: string | null = null;

   try {
      const result = await fetchProducts(slug, page);
      products = result.products;
      pagination = result.pagination;

      if (page === 1 && products.length === 0) {
         notFound();
      }
   } catch (err) {
      console.error(`[CategoryPage] fetch failed for "${slug}":`, err);
      fetchError = "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.";
   }
   const categoryTitle = slugToTitle(slug);
   return (
      <div className="min-h-screen bg-gray-50">
         <div className="bg-white border-b">
            <div className="container py-4">
               <Breadcrumb
                  items={[
                     { label: "Trang chủ", href: "/" },
                     { label: categoryTitle },
                  ]}
               />
               <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {categoryTitle}
               </h1>
               <div className="flex items-center gap-3 mb-5">
                  <span className="text-base text-primary">
                     Tìm sản phẩm theo nhu cầu
                  </span>
                  <span className="text-sm text-primary font-medium flex items-center border rounded-full py-1.5 px-2 cursor-pointer gap-2 hover:bg-gray-50 transition-colors">
                     <ListFilter width={17} height={17} />
                     Dùng bộ lọc ngay
                  </span>
               </div>

               <div className="border-b border-secondary-light mb-4">
                  <nav className="flex items-center gap-6 overflow-x-auto py-3 text-sm font-medium">
                     {SUB_CATEGORIES.map(({ href, label }) => (
                        <Link
                           key={href}
                           href={href}
                           className="whitespace-nowrap text-gray-600 hover:text-red-500 border-b-2 border-transparent hover:border-red-500 pb-1 transition-colors"
                        >
                           {label}
                        </Link>
                     ))}
                  </nav>
               </div>

               <Slidezy
                  items={1}
                  speed={500}
                  autoplay
                  autoplayTimeout={5000}
                  loop
                  nav
                  controls
                  className="rounded-lg overflow-hidden mb-6"
               >
                  {BANNERS.map((img, idx) => (
                     <div key={idx} className="h-35 sm:h-45 md:h-55">
                        <img
                           src={img}
                           alt={`Banner ${categoryTitle} ${idx + 1}`}
                           className="w-full h-full object-cover"
                        />
                     </div>
                  ))}
               </Slidezy>

               <div className="mb-6 pb-6 border-b border-neutral">
                  <h2 className="text-sm font-semibold text-secondary mb-4">
                     Thương hiệu ưa chuộng
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
                     {BRANDS.map(({ href, label, color }) => (
                        <Link
                           key={href}
                           href={href}
                           className="flex items-center justify-center px-3 py-3 bg-white border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all text-center"
                        >
                           <span
                              className="text-sm font-bold leading-tight"
                              style={{ color }}
                           >
                              {label}
                           </span>
                        </Link>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="container py-6">
            <div className="flex gap-6">
               <aside className="w-72 shrink-0 hidden lg:block">
                  <ProductFilter />
               </aside>

               <main className="flex-1 min-w-0">
                  {fetchError ? (
                     <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-lg shadow-sm">
                        <span className="text-5xl mb-4">⚠️</span>
                        <p className="text-lg font-medium text-red-600">
                           {fetchError}
                        </p>
                        <Link
                           href={`/category/${slug}`}
                           className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                           Thử lại
                        </Link>
                     </div>
                  ) : (
                     <Suspense fallback={<ProductGridSkeleton />}>
                        <ProductGrid
                           products={products}
                           pagination={pagination}
                           categorySlug={slug}
                        />
                     </Suspense>
                  )}
               </main>
            </div>
         </div>
      </div>
   );
}
