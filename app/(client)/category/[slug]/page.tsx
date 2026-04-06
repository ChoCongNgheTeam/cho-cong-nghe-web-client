import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import ProductFilter from "../components/ProductFilter";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { Slidezy } from "@/components/Slider";
import { PageProps } from "@/components/product/types";
import { fetchProducts, fetchFilters, fetchCategory } from "../_libs";
import { slugToTitle } from "../components/SlugToTitle";
import { BANNERS, BRANDS, SUB_CATEGORIES } from "../MockData";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import { buildCategoryMetadata } from "./buildMetaData";

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);
  return buildCategoryMetadata(slug, page);
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const rawSearch = await searchParams;
  const page = Math.max(1, Number(rawSearch.page ?? 1) || 1);

  const filterParams: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(rawSearch)) {
    if (value !== undefined) filterParams[key] = value as string | string[];
  }

  const [categoryResult, filtersResult, productsResult] = await Promise.allSettled([fetchCategory(slug), fetchFilters(slug), fetchProducts({ categorySlug: slug, page, searchParams: filterParams })]);

  const resolvedFilters = filtersResult.status === "fulfilled" ? filtersResult.value : [];
  const initialProducts = productsResult.status === "fulfilled" ? productsResult.value.products : [];
  const initialPagination = productsResult.status === "fulfilled" ? productsResult.value.pagination : undefined;
  const fetchError = productsResult.status === "rejected" ? "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau." : null;

  const category = categoryResult.status === "fulfilled" ? categoryResult.value : null;

  const categoryTitle = category?.name || slugToTitle(slug);

  return (
    <div className="min-h-screen bg-neutral-light-active">
      {/* Header */}
      <div className="bg-neutral-light border-b border-neutral">
        <div className="container py-4">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: categoryTitle }]} />
          <h1 className="text-2xl font-bold text-primary mb-3">{categoryTitle}</h1>

          {/* <div className="border-b border-neutral mb-4">
            <nav className="flex items-center gap-6 overflow-x-auto py-3 text-sm font-medium">
              {SUB_CATEGORIES.map(({ href, label }) => (
                <Link key={href} href={href} className="whitespace-nowrap text-primary-light hover:text-promotion border-b-2 border-transparent hover:border-promotion pb-1 transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div> */}
          {/* <Slidezy items={{ mobile: 3, tablet: 4, desktop: 5 }} speed={400} loop nav controls={false} gap={12} slideBy="page" className="mb-6 pb-6 border-b border-neutral">
            {BRANDS.map(({ href, label, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center px-3 py-3 bg-neutral-light border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all text-center"
              >
                <span className="text-sm font-bold leading-tight" style={{ color }}>
                  {label}
                </span>
              </Link>
            ))}
          </Slidezy> */}
        </div>
      </div>

      {/* Main content */}
      <div className="container py-6">
        {/*
          Mobile only: horizontal sort chips + "Lọc" button + bottom sheet.
          ProductFilter tự detect isMobile và render đúng UI.
          Desktop sidebar được render riêng bên dưới với hidden lg:block.
        */}
        <div className="lg:hidden mb-4 rounded-xl overflow-hidden">
          <Suspense fallback={null}>
            <ProductFilter filters={resolvedFilters} />
          </Suspense>
        </div>

        <div className="flex gap-6 items-start">
          {/* Desktop sidebar */}
          <aside id="product-filter" className="w-72 shrink-0 hidden lg:block sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin">
            <Suspense fallback={null}>
              <ProductFilter filters={resolvedFilters} />
            </Suspense>
          </aside>

          <main className="flex-1 min-w-0">
            {fetchError && (
              <div className="flex flex-col items-center justify-center py-20 bg-neutral-light rounded-2xl border border-neutral shadow-sm">
                <span className="text-5xl mb-4">⚠️</span>
                <p className="text-base font-semibold text-promotion mb-1">Đã có lỗi xảy ra</p>
                <p className="text-sm text-primary-light mb-6">{fetchError}</p>
                <Link href={`/category/${slug}`} className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-full text-sm font-semibold transition-colors">
                  Thử lại
                </Link>
              </div>
            )}

            {!fetchError && (
              <Suspense fallback={<ProductGridSkeleton />}>
                <ProductGrid categorySlug={slug} initialProducts={initialProducts} initialPagination={initialPagination} />
              </Suspense>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
