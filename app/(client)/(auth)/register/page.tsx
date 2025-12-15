import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản | ChoCongNghe",
  description: "Tạo tài khoản để mua sắm và theo dõi đơn hàng dễ dàng.",
  alternates: {
    canonical: `${SITE_URL}/register`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-semibold">Đăng ký</h1>

        <form className="space-y-4">
          <input type="text" placeholder="Họ tên" className="w-full rounded-md border px-4 py-3" />
          <input type="email" placeholder="Email" className="w-full rounded-md border px-4 py-3" />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full rounded-md border px-4 py-3"
          />

          <button className="w-full rounded-md bg-black py-3 text-white hover:bg-gray-800">
            Tạo tài khoản
          </button>
        </form>
      </div>
    </section>
  );
}
