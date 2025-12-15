import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Đăng nhập | ChoCongNghe",
  description: "Đăng nhập để quản lý tài khoản và tiếp tục mua sắm.",
  alternates: {
    canonical: `${SITE_URL}/login`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-semibold">Đăng nhập</h1>

        <form className="space-y-4">
          <input type="email" placeholder="Email" className="w-full rounded-md border px-4 py-3" />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full rounded-md border px-4 py-3"
          />

          <button className="w-full rounded-md bg-black py-3 text-white hover:bg-gray-800">
            Đăng nhập
          </button>
        </form>
      </div>
    </section>
  );
}
