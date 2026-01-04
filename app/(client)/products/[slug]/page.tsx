import { SITE_URL } from "@/config/site.config";
import { notFound } from "next/navigation";
import { mockProduct } from "../_lib/mockProduct";
import ProductDetailBanner from "../components/product-detail/product-detail-banner";
import ProductDetailRight from "../components/product-detail/product-detail-card-right";
import ProductDetailSection from "../components/product-detail/product-detail-section";
import ProductDetailSection1 from "../components/product-detail/product-detail-section-1";
import ProductReview from "../components/product-detail/product-detail-review";
import CompareProducts from "../components/product-detail/product-detail-compare";
import ProductDetailSuggest from "../components/product-detail/product-detail-suggest";
import ProductsViewed from "../components/product-detail/products-viewed";

type ProductDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* =========================
   SEO METADATA
========================= */
export async function generateMetadata({ params }: ProductDetailProps) {
  const { slug } = await params;

  const productName = slug.replace(/-/g, " ");
  const url = `${SITE_URL}/products/${slug}`;

  return {
    title: `${mockProduct.name} | Cho Công Nghệ`,
    description: mockProduct.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: mockProduct.name,
      description: mockProduct.description,
      url,
      images: [
        {
          url: `${SITE_URL}/og/product.jpg`,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailProps) {
  const { slug } = await params;

  const productName = slug.replace(/-/g, " ");

  // Giả lập check (sau này thay bằng fetch)
  if (!productName) {
    notFound();
  }
  return (
    <div>
      {/* Hero Section - Product Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-4 sm:mt-6 lg:mt-8">
        <div>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 py-6">
            {/* Left - Product Banner */}
            <div className="w-full lg:w-[60%] lg:sticky lg:top-4 lg:h-fit">
              <ProductDetailBanner />
            </div>

            {/* Right - Product Card */}
            <div className="w-full lg:w-[40%]">
              <div className="lg:sticky lg:top-4 lg:h-fit">
                <ProductDetailRight />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="bg-gray-500/10 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductDetailSection />
        </div>
      </div>

      {/* Product Detail Section 1 */}
      <div className="bg-gray-500/10 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductDetailSection1 />
        </div>
      </div>

      {/* Product Review Section */}
      <div className="bg-gray-500/10  pt-4 sm:pt-6 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductReview />
        </div>
      </div>

      {/* Compare Products Section */}
      <div className="bg-gray-500/10 pt-4 sm:pt-6 ">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <CompareProducts />
        </div>
      </div>
      {/* Suggest Products Section */}
      <div className="bg-gray-500/10 pt-4 sm:pt-6 ">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductDetailSuggest />
        </div>
      </div>
      <div className="bg-gray-500/10 pt-4 sm:pt-6 ">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-white rounded-lg">
          <ProductsViewed />
        </div>
      </div>
    </div>
  );
}
