import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cảm ơn bạn | ChoCongNghe",
  description: "Đơn hàng của bạn đã được ghi nhận.",
  alternates: {
    canonical: `${SITE_URL}/thanks`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThanksPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="mb-4 text-3xl font-bold">🎉 Cảm ơn bạn!</h1>
      <p className="mb-8 text-gray-600">Đơn hàng của bạn đã được ghi nhận và đang được xử lý.</p>

      <Link
        href="/products"
        className="inline-block rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
      >
        Tiếp tục mua sắm
      </Link>
    </section>
  );
}
