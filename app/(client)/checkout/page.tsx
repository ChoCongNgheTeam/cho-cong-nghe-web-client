import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Thanh toán | ChoCongNghe",
  description: "Hoàn tất thông tin để đặt hàng.",
  alternates: {
    canonical: `${SITE_URL}/checkout`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Thanh toán</h1>

      <div className="mx-auto max-w-lg">
        <form className="space-y-4">
          <input type="text" placeholder="Họ tên" className="w-full rounded-md border px-4 py-3" />
          <input type="email" placeholder="Email" className="w-full rounded-md border px-4 py-3" />
          <input
            type="text"
            placeholder="Địa chỉ giao hàng"
            className="w-full rounded-md border px-4 py-3"
          />

          <button
            type="submit"
            className="w-full rounded-md bg-black py-3 text-white hover:bg-gray-800"
          >
            Đặt hàng
          </button>
        </form>
      </div>
    </section>
  );
}
