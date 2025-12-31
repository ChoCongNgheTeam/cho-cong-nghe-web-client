import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Danh sách sản phẩm | My shop",
  description:
    "Khám phá các sản phẩm công nghệ mới nhất: điện thoại, laptop, phụ kiện chính hãng.",
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    title: "Danh sách sản phẩm | My shop",
    description: "Khám phá các sản phẩm công nghệ mới nhất tại My shop.",
    url: `${SITE_URL}/products`,
    images: [
      {
        url: `${SITE_URL}/og/products.jpg`,
      },
    ],
  },
};

const products = [
  {
    slug: "iphone-15-pro-max",
    name: "iPhone 15 Pro",
    price: "$999",
  },
  {
    slug: "macbook-m3",
    name: "MacBook M3",
    price: "$1999",
  },
];

export default function ProductsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Sản phẩm</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="rounded-lg border p-4 hover:shadow"
          >
            <div className="mb-4 h-40 rounded bg-gray-100" />
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-600">{product.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
