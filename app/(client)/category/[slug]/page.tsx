import { Suspense } from "react";
import Link from "next/link";
import { ListFilter, PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import ProductFilter from "../components/ProductFilter";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { Slidezy } from "@/components/Slider";
import { Pagination, Product, PageProps } from "@/components/product/types";
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
      alternates: { canonical: canonicalUrl },
      openGraph: {
         title,
         description,
         url: canonicalUrl,
         siteName,
         locale: "vi_VN",
         type: "website",
      },
      twitter: { card: "summary_large_image", title, description },
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
   } catch (err) {
      console.error(`[CategoryPage] fetch failed for "${slug}":`, err);
      fetchError = "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.";
   }

   const categoryTitle = slugToTitle(slug);
   const isEmpty = !fetchError && products.length === 0;

   return (
      <div className="min-h-screen bg-neutral-light-active">
         {/* Header bar */}
         <div className="bg-neutral-light border-b border-neutral">
            <div className="container py-4">
               <Breadcrumb
                  items={[
                     { label: "Trang chủ", href: "/" },
                     { label: categoryTitle },
                  ]}
               />
               <h1 className="text-2xl font-bold text-primary mb-3">
                  {categoryTitle}
               </h1>

               <div className="flex items-center gap-3 mb-5">
                  <span className="text-base text-primary">
                     Tìm sản phẩm theo nhu cầu
                  </span>
                  <span className="text-sm text-primary font-medium flex items-center border border-neutral rounded-full py-1.5 px-3 cursor-pointer gap-2 hover:bg-neutral-light-active transition-colors">
                     <ListFilter width={17} height={17} />
                     Dùng bộ lọc ngay
                  </span>
               </div>

               {/* Sub-categories nav */}
               <div className="border-b border-neutral mb-4">
                  <nav className="flex items-center gap-6 overflow-x-auto py-3 text-sm font-medium">
                     {SUB_CATEGORIES.map(({ href, label }) => (
                        <Link
                           key={href}
                           href={href}
                           className="whitespace-nowrap text-primary-light hover:text-promotion border-b-2 border-transparent hover:border-promotion pb-1 transition-colors"
                        >
                           {label}
                        </Link>
                     ))}
                  </nav>
               </div>

               {/* Banner */}
               <Slidezy
                  items={1}
                  speed={500}
                  autoplay
                  autoplayTimeout={5000}
                  loop
                  nav
                  controls
                  className="rounded-xl overflow-hidden mb-6"
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

               {/* Brands */}
               <div className="mb-6 pb-6 border-b border-neutral">
                  <h2 className="text-sm font-semibold text-primary-light mb-4">
                     Thương hiệu ưa chuộng
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
                     {BRANDS.map(({ href, label, color }) => (
                        <Link
                           key={href}
                           href={href}
                           className="flex items-center justify-center px-3 py-3 bg-neutral-light border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all text-center"
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

         {/* Main content */}
         <div className="container py-6">
            <div className="flex gap-6 items-start">
               <aside className="w-72 shrink-0 hidden lg:block sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin">
                  <ProductFilter />
               </aside>

               <main className="flex-1 min-w-0">
                  {/* Error state */}
                  {fetchError && (
                     <div className="flex flex-col items-center justify-center py-20 bg-neutral-light rounded-2xl border border-neutral shadow-sm">
                        <span className="text-5xl mb-4">⚠️</span>
                        <p className="text-base font-semibold text-promotion mb-1">
                           Đã có lỗi xảy ra
                        </p>
                        <p className="text-sm text-primary-light mb-6">
                           {fetchError}
                        </p>
                        <Link
                           href={`/category/${slug}`}
                           className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-full text-sm font-semibold transition-colors"
                        >
                           Thử lại
                        </Link>
                     </div>
                  )}

                  {/* Empty state */}
                  {isEmpty && (
                     <div className="flex flex-col items-center justify-center py-24 bg-neutral-light rounded-2xl border border-neutral shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center mb-5">
                           <PackageSearch className="w-10 h-10 text-accent" />
                        </div>
                        <h3 className="text-lg font-bold text-primary mb-2">
                           Chưa có sản phẩm nào
                        </h3>
                        <p className="text-sm text-primary-light text-center max-w-xs mb-6">
                           Danh mục{" "}
                           <span className="font-semibold text-primary">
                              {categoryTitle}
                           </span>{" "}
                           đang được cập nhật. Vui lòng quay lại sau!
                        </p>
                        <Link
                           href="/"
                           className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-full text-sm font-semibold transition-colors"
                        >
                           Về trang chủ
                        </Link>
                     </div>
                  )}

                  {/* Product grid */}
                  {!fetchError && !isEmpty && (
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
