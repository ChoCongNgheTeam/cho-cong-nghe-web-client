import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Giỏ hàng | ChoCongNghe",
  description: "Xem và quản lý các sản phẩm trong giỏ hàng của bạn.",
  alternates: {
    canonical: `${SITE_URL}/cart`,
  },
};

export default function CartPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Giỏ hàng</h1>

      {/* Cart items (static) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h2 className="font-semibold">iPhone 15 Pro</h2>
            <p className="text-sm text-gray-600">Số lượng: 1</p>
          </div>
          <span className="font-medium">$999</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <span className="text-lg font-semibold">Tổng cộng</span>
        <span className="text-lg font-bold">$999</span>
      </div>

      <div className="mt-6">
        <Link
          href="/checkout"
          className="inline-block rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Tiến hành thanh toán
        </Link>
      </div>
    </section>
  );
}
