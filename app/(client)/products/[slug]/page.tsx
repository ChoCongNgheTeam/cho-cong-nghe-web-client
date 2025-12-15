import { SITE_URL } from "@/config/site.config";
import { notFound } from "next/navigation";

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
    title: `Sản phẩm ${productName}`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `Sản phẩm ${productName}`,
      url,
      images: [
        {
          url: `${SITE_URL}/og/product.jpg`,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { slug } = await params;

  const productName = slug.replace(/-/g, " ");

  // Giả lập check (sau này thay bằng fetch)
  if (!productName) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-12 md:grid-cols-2">
        {/* Image */}
        <div className="h-96 rounded-lg bg-gray-100" />

        {/* Info */}
        <div>
          <h1 className="mb-4 text-3xl font-bold">Product: {productName}</h1>

          <p className="mb-6 text-gray-600">Đây là trang chi tiết sản phẩm.</p>

          <p className="mb-8 text-2xl font-semibold">$999</p>

          <button className="rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800">
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </section>
  );
}
