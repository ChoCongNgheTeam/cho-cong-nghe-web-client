import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ProductFilter from "../components/ProductFilter";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { Slidezy } from "@/components/Slider";
import { PageProps } from "@/components/product/types";
import { fetchProducts, fetchFilters, fetchCategory, fetchBrandsByCategory, fetchBannersByCategory, isRootCategory } from "../_libs";
import { slugToTitle } from "../components/SlugToTitle";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import { buildCategoryMetadata } from "./buildMetaData";
import { BrandApiItem, MediaApiItem } from "../types";
import MobileBottomNav from "@/components/layout/Header/components/MobileBottomNav";

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

  const isRoot = isRootCategory(slug);

  // Fetch song song — root category thêm brands + banners
  const [categoryResult, filtersResult, productsResult, brandsResult, bannersResult] = await Promise.allSettled([
    fetchCategory(slug),
    fetchFilters(slug),
    fetchProducts({ categorySlug: slug, page, searchParams: filterParams }),
    isRoot ? fetchBrandsByCategory(slug) : Promise.resolve([]),
    isRoot ? fetchBannersByCategory(slug) : Promise.resolve([]),
  ]);

  const resolvedFilters = filtersResult.status === "fulfilled" ? filtersResult.value : [];
  const initialProducts = productsResult.status === "fulfilled" ? productsResult.value.products : [];
  const initialPagination = productsResult.status === "fulfilled" ? productsResult.value.pagination : undefined;
  const fetchError = productsResult.status === "rejected" ? "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau." : null;
  const category = categoryResult.status === "fulfilled" ? categoryResult.value : null;
  const brands: BrandApiItem[] = brandsResult.status === "fulfilled" ? (brandsResult.value as BrandApiItem[]) : [];
  const banners: MediaApiItem[] = bannersResult.status === "fulfilled" ? (bannersResult.value as MediaApiItem[]) : [];

  const categoryTitle = category?.name || slugToTitle(slug);

  // Sub-categories từ category.children (nếu BE trả về)
  // const subCategories = category?.children?.filter((c) => c.isActive) ?? [];

  return (
    <div className="min-h-screen bg-neutral-light-active">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-light border-b border-neutral">
        <div className="container py-4">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: categoryTitle }]} />

          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-primary">{categoryTitle}</h1>
              {category?.description && <p className="text-sm text-primary mt-1">{category.description}</p>}
            </div>
            {/* Category hero image nếu có */}
            {category?.imageUrl && (
              <div className="shrink-0 hidden md:block">
                <Image src={category.imageUrl} alt={categoryTitle} width={160} height={80} className="object-contain h-16 w-auto" priority />
              </div>
            )}
          </div>

          {/* Sub-categories từ API */}
          {/* {subCategories.length > 0 && (
            <nav className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-neutral mb-4 scrollbar-none">
              {subCategories.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/category/${sub.slug}`}
                  className="whitespace-nowrap text-sm font-medium text-primary hover:text-accent border border-neutral hover:border-accent rounded-full px-4 py-1.5 transition-colors shrink-0"
                >
                  {sub.name}
                </Link>
              ))}
            </nav>
          )} */}

          {/* ── Root category only: Banner Slideshow ──────────────────── */}
          {isRoot && banners.length > 0 && (
            <div className="mb-5 rounded-xl overflow-hidden">
              <Slidezy items={{ mobile: 1, tablet: 1, desktop: 1 }} speed={500} loop autoplay nav controls gap={0} className="rounded-xl">
                {banners
                  .filter((banner) => banner.imageUrl) // bỏ qua nếu không có ảnh
                  .map((banner) => (
                    <div key={banner.id} className="relative w-full aspect-[1440/400]">
                      {banner.linkUrl ? (
                        <Link href={banner.linkUrl} className="absolute inset-0">
                          <Image src={banner.imageUrl ?? ""} alt={banner.title ?? categoryTitle} fill className="object-contain" priority />
                        </Link>
                      ) : (
                        <Image src={banner.imageUrl ?? ""} alt={banner.title ?? categoryTitle} fill className="object-contain" priority />
                      )}
                    </div>
                  ))}
              </Slidezy>
            </div>
          )}

          {/* ── Root category only: Brand logos ───────────────────────── */}
          {isRoot && brands.length > 0 && (
            <Slidezy items={{ mobile: 4, tablet: 6, desktop: 8 }} speed={400} loop={false} nav={false} controls={false} gap={10} slideBy="page" className="pb-2">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/category/${brand.slug}`}
                  className="flex items-center justify-center px-3 py-2.5 bg-neutral-light border border-neutral rounded-xl hover:border-accent hover:shadow-sm transition-all text-center min-h-[52px]"
                >
                  {brand.imageUrl ? (
                    <Image src={brand.imageUrl} alt={brand.name} width={80} height={32} className="object-contain h-8 w-auto max-w-[80px]" />
                  ) : (
                    <span className="text-sm font-bold text-primary leading-tight">{brand.name}</span>
                  )}
                </Link>
              ))}
            </Slidezy>
          )}
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="container py-6">
        {/* Mobile filter */}
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
                <p className="text-sm text-primary mb-6">{fetchError}</p>
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
      <MobileBottomNav />
    </div>
  );
}
